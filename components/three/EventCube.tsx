'use client';

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { sampleEased } from '@/lib/color';
import { KEYS } from '@/lib/timeline';
import { useSceneStore } from '@/lib/sceneStore';
import { Church, Community, Concert, Party } from './dioramas';

const GLB_URL = '/models/event-cube.glb';
const XS = KEYS.map((q) => q.x);
const YS = KEYS.map((q) => q.y);
const ZS = KEYS.map((q) => q.z);
const YAW = KEYS.map((q) => q.yaw);
const PITCH = KEYS.map((q) => q.pitch);
const damp = THREE.MathUtils.damp;

/** True when /public/models/event-cube.glb exists (null while checking). */
function useGlbAvailable() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch(GLB_URL, { method: 'HEAD' })
      .then((r) => live && setOk(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')))
      .catch(() => live && setOk(false));
    return () => { live = false; };
  }, []);
  return ok;
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? this.props.fallback : this.props.children; }
}

/** The Blender/GLB model. "emit_*" materials glow (and bloom); the disco ball, spotlights, candles and LED tiles animate. */
function GlbBody() {
  const { scene } = useGLTF(GLB_URL);
  const fx = useMemo(() => {
    const emissive: Record<string, THREE.MeshStandardMaterial> = {};
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat.name.startsWith('emit_')) { mat.emissiveIntensity = 2.4; emissive[mat.name] = mat; }
      if (mat.name.startsWith('beam_')) { mat.depthWrite = false; mat.emissiveIntensity = 1.2; }
    });
    return {
      emissive,
      disco: scene.getObjectByName('DiscoBall'),
      spots: [0, 1, 2, 3].map((i) => scene.getObjectByName(`Spot_${i}`)),
    };
  }, [scene]);

  useEffect(() => { useSceneStore.getState().setReady(true); }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (fx.disco) fx.disco.rotation.y += dt * 0.9;
    fx.spots.forEach((s, i) => { if (s) s.rotation.z = Math.sin(t * 1.4 + i * 1.3) * 0.4; });
    const f = fx.emissive.emit_flame; if (f) f.emissiveIntensity = 2.4 + Math.sin(t * 9) * 0.4 + Math.sin(t * 23) * 0.2;
    const a = fx.emissive.emit_tile_a; if (a) a.emissiveIntensity = 1.8 + Math.sin(t * 4) * 0.9;
    const b = fx.emissive.emit_tile_b; if (b) b.emissiveIntensity = 1.8 + Math.sin(t * 4 + Math.PI) * 0.9;
  });
  return <primitive object={scene} />;
}

/** Fallback when the GLB is missing: the original hand-built boxes. */
function ProceduralBody() {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), []);
  const faces = ['#3a1038', '#12403a', '#1a1830', '#0d0c16', '#261a5e', '#4a3b1f']; // +x, -x, +y, -y, +z, -z
  useEffect(() => { useSceneStore.getState().setReady(true); }, []);
  return (
    <>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        {faces.map((c, i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={c} roughness={0.6} metalness={0.15} />
        ))}
      </mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color="#ffffff" transparent opacity={0.25} /></lineSegments>
      <group><Concert /></group>
      <group rotation={[0, Math.PI / 2, 0]}><Party /></group>
      <group rotation={[0, Math.PI, 0]}><Church /></group>
      <group rotation={[0, -Math.PI / 2, 0]}><Community /></group>
    </>
  );
}

export default function EventCube() {
  const rig = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const intro = useRef(0);
  const { camera } = useThree();
  const glb = useGlbAvailable();
  const accents = useMemo(() => KEYS.map((q) => new THREE.Color(q.accent)), []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useFrame((state, dt) => {
    if (!rig.current || !spin.current) return;
    const { progress: p, revealed } = useSceneStore.getState();
    smooth.current.x = damp(smooth.current.x, mouse.current.x, 3.5, dt);
    smooth.current.y = damp(smooth.current.y, mouse.current.y, 3.5, dt);
    intro.current = damp(intro.current, revealed ? 1 : 0, 1.5, dt);
    const e = intro.current * intro.current * (3 - 2 * intro.current); // launch: dolly in + settle

    const cam = camera as THREE.PerspectiveCamera;
    const narrow = cam.aspect < 1.15; // phones: centre the box, pull back so it fits
    const z = sampleEased(ZS, p) * (narrow ? 1.55 : 1) + (1 - e) * 3;
    cam.position.set(0, z * 0.17, z);
    cam.lookAt(0, 0, 0);

    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * z;
    const w = h * cam.aspect;
    const calm = 1 - 0.5 * THREE.MathUtils.smoothstep(p, 3, 4); // less cursor tilt while zoomed out
    rig.current.position.set(
      (narrow ? 0 : sampleEased(XS, p) * w) + smooth.current.x * 0.1,
      (narrow ? 0.2 * h : sampleEased(YS, p) * h) + Math.sin(state.clock.elapsedTime * 0.8) * 0.05 - smooth.current.y * 0.06,
      0,
    );
    rig.current.scale.setScalar(0.88 + 0.12 * e);
    rig.current.rotation.x = sampleEased(PITCH, p) + smooth.current.y * 0.14 * calm;
    spin.current.rotation.y = sampleEased(YAW, p) + smooth.current.x * 0.3 * calm + (1 - e) * 0.9;

    const i = Math.min(Math.floor(p), accents.length - 2);
    const f = Math.min(Math.max(p - i, 0), 1);
    key.current?.color.copy(accents[i]).lerp(accents[i + 1], f);
    rim.current?.color.copy(accents[i + 1]).lerp(accents[i], 1 - f);
  });

  if (glb === null) return null;
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} />
      <pointLight ref={key} position={[-3.5, 1.5, 4]} intensity={50} distance={18} />
      <pointLight ref={rim} position={[4, 2.5, -4]} intensity={40} distance={18} />
      <group ref={rig}>
        <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={9} blur={2.6} far={3} resolution={256} frames={1} color="#000000" />
        <group ref={spin}>
          {glb ? (
            <Boundary fallback={<ProceduralBody />}><GlbBody /></Boundary>
          ) : (
            <ProceduralBody />
          )}
        </group>
      </group>
    </>
  );
}

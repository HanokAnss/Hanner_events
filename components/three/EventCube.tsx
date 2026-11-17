'use client';
 
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SECTIONS } from '@/lib/sections';
import { sampleEased } from '@/lib/color';
import { POSES } from '@/lib/poses';
import { useSceneStore } from '@/lib/sceneStore';
import { Church, Community, Concert, Party } from './dioramas';
 
const GLB_URL = '/models/event-cube.glb';
 
// Per-section pose channels (see lib/poses.ts).
const XS = POSES.map((q) => q.x);
const YS = POSES.map((q) => q.y);
const ZS = POSES.map((q) => q.z);
const YAW = POSES.map((q) => q.yaw);
const PITCH = POSES.map((q) => q.pitch);
const damp = THREE.MathUtils.damp;
 
/** True when /public/models/event-cube.glb exists (exported from Blender). */
function useGlbAvailable() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(GLB_URL, { method: 'HEAD' })
      .then((r) => live && setOk(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return ok;
}
 
function GlbBody() {
  const { scene } = useGLTF(GLB_URL);
  return <primitive object={scene} />;
}
 
function ProceduralBody() {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), []);
  // material order: +x, -x, +y, -y, +z, -z
  const faces = ['#3a1038', '#12403a', '#1a1830', '#0d0c16', '#261a5e', '#4a3b1f'];
  return (
    <>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        {faces.map((c, i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={c} roughness={0.6} metalness={0.15} />
        ))}
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </lineSegments>
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
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const glb = useGlbAvailable();
  const accents = useMemo(() => SECTIONS.map((s) => new THREE.Color(s.accent)), []);
 
  // Cursor position, normalised to -1..1, tracked on the window so the HTML overlay never blocks it.
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
    const p = useSceneStore.getState().progress; // already spring-smoothed by Framer Motion
 
    smooth.current.x = damp(smooth.current.x, mouse.current.x, 3.5, dt);
    smooth.current.y = damp(smooth.current.y, mouse.current.y, 3.5, dt);
 
    // Zoom: camera distance per section, keeping a constant viewing elevation.
    const cam = camera as THREE.PerspectiveCamera;
    const z = sampleEased(ZS, p);
    cam.position.set(0, z * 0.17, z);
    cam.lookAt(0, 0, 0);
 
    // Left / right / up / down: pose offsets are fractions of the visible size at the box's depth.
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * z;
    const w = h * cam.aspect;
 
    // Pitch drives the upside-down flip; calm the cursor tilt as the underside comes into view.
    const pitch = sampleEased(PITCH, p);
    const flip = THREE.MathUtils.clamp(-pitch / (Math.PI / 2), 0, 1);
    const calm = 1 - 0.6 * flip;
 
    rig.current.position.set(
      sampleEased(XS, p) * w + smooth.current.x * 0.12,
      sampleEased(YS, p) * h + Math.sin(state.clock.elapsedTime * 0.8) * 0.06 - smooth.current.y * 0.08,
      0,
    );
    rig.current.rotation.x = pitch + smooth.current.y * 0.22 * calm;
    spin.current.rotation.y = sampleEased(YAW, p) + smooth.current.x * 0.45 * calm;
 
    if (key.current) {
      const i = Math.min(Math.floor(p), accents.length - 2);
      key.current.color.copy(accents[i]).lerp(accents[i + 1], Math.min(Math.max(p - i, 0), 1));
    }
  });
 
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <directionalLight position={[0, -4, 5]} intensity={0.5} />
      <pointLight ref={key} position={[-3, 1.5, 4]} intensity={45} distance={16} />
      <group ref={rig}>
        <group ref={spin}>
          {glb ? <GlbBody /> : <ProceduralBody />}
        </group>
      </group>
    </>
  );
}
 

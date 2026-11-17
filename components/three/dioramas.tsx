'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import { Ball, Box, Cone, Cyl, Ledge, Person, Tree, type V3 } from './primitives';

const SHIRTS = ['#e76f51', '#2a9d8f', '#e9c46a', '#8ab17d', '#f4a261', '#6d6875', '#c77dff'];

/* ───────────────────────── Live concert (+Z) ───────────────────────── */
const SPOT_X = [-0.6, -0.2, 0.2, 0.6];
const SPOT_C = ['#ff5d73', '#9d8cff', '#ffd166', '#4cc9f0'];

export function Concert() {
  const spots = useRef<Group>(null);
  useFrame(({ clock }) => {
    spots.current?.children.forEach((c, i) => {
      c.rotation.z = Math.sin(clock.elapsedTime * 1.4 + i * 1.3) * 0.4;
    });
  });
  const crowd: { p: V3; c: string }[] = [];
  for (let r = 0; r < 3; r++)
    for (let k = 0; k < 7; k++)
      crowd.push({ p: [-0.7 + k * 0.23 + (r % 2) * 0.1, -0.95, 1.68 + r * 0.14], c: SHIRTS[(r * 3 + k) % SHIRTS.length] });

  return (
    <group>
      <Ledge />
      <Box s={[1.7, 0.12, 0.6]} p={[0, -0.89, 1.35]} c="#1d1a33" />
      <Box s={[1.7, 1.0, 0.05]} p={[0, -0.33, 1.08]} c="#120f26" />
      <Box s={[1.5, 0.8, 0.02]} p={[0, -0.33, 1.115]} c="#7c5cff" e="#7c5cff" ei={0.9} />
      <Box s={[1.9, 0.05, 0.05]} p={[0, 0.35, 1.55]} c="#8a869e" m={0.8} rough={0.3} />
      <Box s={[0.05, 1.3, 0.05]} p={[-0.92, -0.3, 1.55]} c="#8a869e" m={0.8} rough={0.3} />
      <Box s={[0.05, 1.3, 0.05]} p={[0.92, -0.3, 1.55]} c="#8a869e" m={0.8} rough={0.3} />
      <group ref={spots} position={[0, 0.32, 1.55]}>
        {SPOT_X.map((x, i) => (
          <group key={x} position={[x, 0, 0]}>
            <Box s={[0.08, 0.06, 0.08]} p={[0, 0, 0]} c="#222" />
            <Cone r={0.2} h={0.75} p={[0, -0.375, 0]} seg={16} c={SPOT_C[i]} e={SPOT_C[i]} ei={1.5} o={0.16} />
          </group>
        ))}
      </group>
      {[-0.98, 0.98].map((x) => (
        <group key={x}>
          <Box s={[0.26, 0.5, 0.26]} p={[x, -0.7, 1.5]} c="#15131f" />
          <Box s={[0.22, 0.32, 0.22]} p={[x, -0.29, 1.5]} c="#15131f" />
          <Cyl rt={0.07} h={0.02} p={[x, -0.7, 1.64]} rot={[Math.PI / 2, 0, 0]} c="#3b3558" />
        </group>
      ))}
      <Person p={[0, -0.83, 1.3]} c="#ff5d73" scale={1.3} />
      {crowd.map((g, i) => (
        <Person key={i} p={g.p} c={g.c} />
      ))}
    </group>
  );
}

/* ───────────────────────── DJ night / party (+X) ───────────────────────── */
function Tile({ p, c, i }: { p: V3; c: string; i: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const mat = ref.current?.material as MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = 0.35 + 0.45 * Math.sin(clock.elapsedTime * 3 + i * 0.9);
  });
  return (
    <mesh ref={ref} position={p}>
      <boxGeometry args={[0.36, 0.02, 0.26]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
    </mesh>
  );
}

const TILE_C = ['#ff4fa3', '#4cc9f0', '#ffd166', '#9d8cff'];

export function Party() {
  const ball = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ball.current) ball.current.rotation.y += dt * 0.9;
  });
  const bulbs = Array.from({ length: 9 }, (_, k) => {
    const x = -0.95 + k * 0.2375;
    return [x, 0.8 - 0.18 * (1 - (x / 0.95) ** 2), 1.88] as V3;
  });
  return (
    <group>
      <Ledge c="#2a1630" />
      <Box s={[0.9, 0.32, 0.34]} p={[0, -0.79, 1.22]} c="#1b0f26" />
      <Box s={[0.9, 0.02, 0.34]} p={[0, -0.62, 1.22]} c="#ff4fa3" e="#ff4fa3" ei={0.8} />
      {[-0.22, 0.22].map((x) => (
        <Cyl key={x} rt={0.11} h={0.02} p={[x, -0.6, 1.22]} c="#222" m={0.7} rough={0.3} />
      ))}
      <Person p={[0, -0.62, 1.05]} c="#c77dff" scale={1.3} />
      {[-0.85, 0.85].map((x) => (
        <group key={x}>
          <Box s={[0.3, 0.7, 0.3]} p={[x, -0.6, 1.3]} c="#15101c" />
          <Cyl rt={0.08} h={0.02} p={[x, -0.45, 1.46]} rot={[Math.PI / 2, 0, 0]} c="#4a3358" />
          <Cyl rt={0.1} h={0.02} p={[x, -0.72, 1.46]} rot={[Math.PI / 2, 0, 0]} c="#4a3358" />
        </group>
      ))}
      <group ref={ball} position={[0, 0.5, 1.5]}>
        <Cyl rt={0.01} h={0.7} p={[0, 0.45, 0]} c="#aaa" />
        <Ball r={0.22} p={[0, 0, 0]} ico c="#dfe6ff" m={1} rough={0.15} />
      </group>
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return <Tile key={i} i={i} c={TILE_C[(col + row) % 4]} p={[-0.6 + col * 0.4, -0.945, 1.55 + row * 0.28]} />;
      })}
      {[-0.95, 0.95].map((x) => (
        <Cyl key={x} rt={0.012} h={1.8} p={[x, -0.05, 1.88]} c="#555" />
      ))}
      {bulbs.map((p, i) => (
        <Ball key={i} r={0.03} p={p} c="#ffe08a" e="#ffd166" ei={2} />
      ))}
    </group>
  );
}

/* ───────────────────────── Church gathering (−Z) ───────────────────────── */
export function Church() {
  const cx = -0.2;
  return (
    <group>
      <Ledge c="#3a3020" />
      <Box s={[0.9, 0.75, 0.6]} p={[cx, -0.575, 1.4]} c="#d8cdb8" />
      <Box s={[0.67, 0.04, 0.66]} p={[cx - 0.225, 0.05, 1.4]} rot={[0, 0, 0.84]} c="#8a4b3a" />
      <Box s={[0.67, 0.04, 0.66]} p={[cx + 0.225, 0.05, 1.4]} rot={[0, 0, -0.84]} c="#8a4b3a" />
      <Box s={[0.28, 1.1, 0.28]} p={[0.5, -0.4, 1.45]} c="#cfc3ac" />
      <Cone r={0.22} h={0.45} p={[0.5, 0.375, 1.45]} rot={[0, Math.PI / 4, 0]} c="#6b4033" />
      <Box s={[0.03, 0.22, 0.03]} p={[0.5, 0.71, 1.45]} c="#f2c46d" e="#f2c46d" ei={0.8} />
      <Box s={[0.12, 0.03, 0.03]} p={[0.5, 0.76, 1.45]} c="#f2c46d" e="#f2c46d" ei={0.8} />
      {/* stained-glass window and door */}
      <mesh position={[cx, -0.4, 1.702]}>
        <circleGeometry args={[0.17, 28]} />
        <meshStandardMaterial color="#f2c46d" emissive="#f2c46d" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[cx, -0.4, 1.705]}>
        <circleGeometry args={[0.1, 28]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[cx, -0.4, 1.708]}>
        <circleGeometry args={[0.04, 20]} />
        <meshStandardMaterial color="#7c5cff" emissive="#7c5cff" emissiveIntensity={1} />
      </mesh>
      <Box s={[0.2, 0.32, 0.02]} p={[cx, -0.79, 1.705]} c="#5b3a29" />
      <Box s={[0.22, 0.012, 0.3]} p={[cx, -0.945, 1.85]} c="#b7a98a" />
      {[-0.85, -0.7, 0.2, 0.35].map((x) => (
        <group key={x}>
          <Cyl rt={0.02} h={0.12} p={[x, -0.89, 1.85]} c="#f5efe0" />
          <Ball r={0.025} p={[x, -0.8, 1.85]} c="#ffb347" e="#ffb347" ei={2.5} />
        </group>
      ))}
      <Tree p={[-0.88, -0.95, 1.6]} s={0.9} />
      <Person p={[0.7, -0.95, 1.8]} c="#6d6875" />
      <Person p={[0.82, -0.95, 1.72]} c="#8d99ae" />
    </group>
  );
}

/* ───────────────────────── Community gathering (−X) ───────────────────────── */
export function Community() {
  const bunting = Array.from({ length: 10 }, (_, k) => {
    const x = -0.9 + k * 0.2;
    return { p: [x, 0.05 - 0.15 * (1 - (x / 0.95) ** 2), 1.88] as V3, c: ['#ff7a59', '#ffd166', '#5fd1a5', '#4cc9f0'][k % 4] };
  });
  const poles: V3[] = [[-0.7, 0, 1.3], [-0.2, 0, 1.3], [-0.7, 0, 1.7], [-0.2, 0, 1.7]];
  return (
    <group>
      <Ledge c="#18332e" />
      {poles.map(([x, , z]) => (
        <Cyl key={`${x}${z}`} rt={0.015} h={0.5} p={[x, -0.7, z]} c="#d9d4c7" />
      ))}
      <Cone r={0.42} h={0.3} p={[-0.45, -0.3, 1.5]} rot={[0, Math.PI / 4, 0]} c="#f6e7c1" />
      <Cone r={0.2} h={0.12} p={[-0.45, -0.09, 1.5]} rot={[0, Math.PI / 4, 0]} c="#ff7a59" />
      <Box s={[0.45, 0.03, 0.18]} p={[-0.45, -0.78, 1.5]} c="#7a5c3e" />
      {[-0.58, -0.45, -0.32].map((x, i) => (
        <Ball key={x} r={0.035} p={[x, -0.72, 1.5]} c={['#e76f51', '#e9c46a', '#8ab17d'][i]} />
      ))}
      <Box s={[0.5, 0.03, 0.2]} p={[0.4, -0.8, 1.55]} c="#7a5c3e" />
      <Box s={[0.5, 0.03, 0.1]} p={[0.4, -0.88, 1.74]} c="#5a432d" />
      <Person p={[0.25, -0.95, 1.85]} c="#e76f51" />
      <Person p={[0.55, -0.95, 1.85]} c="#2a9d8f" />
      <Person p={[-0.45, -0.95, 1.75]} c="#e9c46a" />
      <Person p={[0.4, -0.95, 1.38]} c="#c77dff" />
      <Tree p={[0.88, -0.95, 1.5]} s={1.1} />
      {[-0.95, 0.95].map((x) => (
        <Cyl key={x} rt={0.012} h={1.2} p={[x, -0.35, 1.88]} c="#d9d4c7" />
      ))}
      {bunting.map((b, i) => (
        <Box key={i} s={[0.08, 0.08, 0.01]} p={b.p} rot={[0, 0, Math.PI / 4]} c={b.c} />
      ))}
    </group>
  );
}

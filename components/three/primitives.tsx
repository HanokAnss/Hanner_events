'use client';
/**
 * Tiny building blocks for the dioramas. Every diorama is authored in a local frame
 * where the cube face sits at z = 1 and "outward" is +z; EventCube rotates it onto the right face.
 */
export type V3 = [number, number, number];

interface MatProps {
  c: string; // colour
  e?: string; // emissive colour
  ei?: number; // emissive intensity
  m?: number; // metalness
  rough?: number; // roughness
  o?: number; // opacity (enables transparency)
}

function Mat({ c, e, ei = 1, m = 0.05, rough = 0.75, o }: MatProps) {
  return (
    <meshStandardMaterial
      color={c}
      emissive={e ?? '#000000'}
      emissiveIntensity={e ? ei : 0}
      metalness={m}
      roughness={rough}
      transparent={o !== undefined}
      opacity={o ?? 1}
      depthWrite={o === undefined}
    />
  );
}

export function Box({ s, p, rot, ...mat }: { s: V3; p: V3; rot?: V3 } & MatProps) {
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      <Mat {...mat} />
    </mesh>
  );
}

export function Cyl({ rt, rb, h, p, rot, seg = 14, ...mat }: { rt: number; rb?: number; h: number; p: V3; rot?: V3; seg?: number } & MatProps) {
  return (
    <mesh position={p} rotation={rot}>
      <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
      <Mat {...mat} />
    </mesh>
  );
}

export function Cone({ r, h, p, rot, seg = 4, ...mat }: { r: number; h: number; p: V3; rot?: V3; seg?: number } & MatProps) {
  return (
    <mesh position={p} rotation={rot}>
      <coneGeometry args={[r, h, seg]} />
      <Mat {...mat} />
    </mesh>
  );
}

export function Ball({ r, p, ico, ...mat }: { r: number; p: V3; ico?: boolean } & MatProps) {
  return (
    <mesh position={p}>
      {ico ? <icosahedronGeometry args={[r, 1]} /> : <sphereGeometry args={[r, 14, 12]} />}
      <Mat {...mat} />
    </mesh>
  );
}

/** A simple guest: body + head. `p` is where the feet touch the ground. */
export function Person({ p, c, scale = 1 }: { p: V3; c: string; scale?: number }) {
  return (
    <group position={p} scale={scale}>
      <Cyl rt={0.035} rb={0.048} h={0.14} p={[0, 0.07, 0]} c={c} />
      <Ball r={0.04} p={[0, 0.18, 0]} c="#e8c9a8" />
    </group>
  );
}

/** The ground ledge in front of each face; its top surface is at y = -0.95. */
export function Ledge({ c = '#2b2740' }: { c?: string }) {
  return <Box s={[2.1, 0.1, 1.0]} p={[0, -1, 1.45]} c={c} />;
}

export function Tree({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl rt={0.025} rb={0.035} h={0.25} p={[0, 0.125, 0]} c="#6b4a33" />
      <Ball r={0.17} p={[0, 0.38, 0]} c="#2f8f5b" />
    </group>
  );
}

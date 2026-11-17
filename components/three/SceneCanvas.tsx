'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import EventCube from './EventCube';

export default function SceneCanvas() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.4, 8], fov: 35 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <EventCube />
      </Suspense>
    </Canvas>
  );
}

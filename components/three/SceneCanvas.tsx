'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import EventCube from './EventCube';

/** `running` pauses rendering once the stage has scrolled out of view. */
export default function SceneCanvas({ running = true }: { running?: boolean }) {
  const [degraded, setDegraded] = useState(false); // drops bloom + resolution if the GPU struggles

  return (
    <Canvas
      flat // tone mapping is done by the ToneMapping effect below
      frameloop={running ? 'always' : 'never'}
      dpr={degraded ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.8, 5], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={() => setDegraded(true)} />
      <Suspense fallback={null}>
        {/* Procedural studio lighting: no HDR download. */}
        <Environment resolution={256} environmentIntensity={0.9}>
          <Lightformer form="rect" intensity={4} position={[0, 5, 3]} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2} color="#9d8cff" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
          <Lightformer form="rect" intensity={2} color="#ff9f5a" position={[6, 0, -2]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
          <Lightformer form="ring" intensity={1.5} position={[0, -3, 4]} scale={4} />
        </Environment>
        <EventCube />
      </Suspense>
      {degraded ? (
        <EffectComposer multisampling={0}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

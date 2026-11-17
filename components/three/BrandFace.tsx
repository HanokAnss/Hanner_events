'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { BRAND_WORD } from '@/lib/poses';
import { useSceneStore } from '@/lib/sceneStore';

export default function BrandFace() {
  const material = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const reveal = THREE.MathUtils.smoothstep(useSceneStore.getState().progress, 4.55, 4.95);
    if (material.current) material.current.opacity = reveal;
  });

  return (
    <Text
      position={[0, -1.015, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      anchorX="center"
      anchorY="middle"
      fontSize={0.22}
      letterSpacing={0.02}
      color="#f2c46d"
    >
      {BRAND_WORD}
      <meshStandardMaterial ref={material} color="#f2c46d" emissive="#6b4d1f" emissiveIntensity={0.35} roughness={0.45} transparent />
    </Text>
  );
}
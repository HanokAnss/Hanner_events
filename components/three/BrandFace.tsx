'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { BRAND_WORD } from '@/lib/poses';
import { useSceneStore } from '@/lib/sceneStore';

export default function BrandFace() {
  const text = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (text.current) text.current.visible = useSceneStore.getState().progress > 4.55;
  });

  return (
    <Text
      ref={text}
      position={[0, -1.015, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      anchorX="center"
      anchorY="middle"
      fontSize={0.22}
      letterSpacing={0.02}
      color="#f2c46d"
    >
      {BRAND_WORD}
    </Text>
  );
}
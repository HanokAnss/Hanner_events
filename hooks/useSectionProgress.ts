'use client';
import { useCallback, useEffect, useState } from 'react';
import { useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useSceneStore } from '@/lib/sceneStore';

/**
 * Native scrolling drives a float section index (0 … count-1). Framer Motion's spring eases it, so the
 * 3D box, the text layers, the colours and the particles all glide from the same smoothed value.
 */
export function useSectionProgress(count: number) {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll();
  const raw = useTransform(scrollYProgress, [0, 1], [0, count - 1]);
  const progress = useSpring(raw, { stiffness: 85, damping: 22, mass: 0.9, restDelta: 0.0005 });

  useMotionValueEvent(progress, 'change', (v) => {
    useSceneStore.getState().setProgress(v);
    const a = Math.round(v);
    setActive((prev) => (prev === a ? prev : a));
  });

  useEffect(() => {
    useSceneStore.getState().setProgress(progress.get());
    return () => useSceneStore.getState().setProgress(0);
  }, [progress]);

  const goTo = useCallback((i: number) => {
    window.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' });
  }, []);

  return { progress, active, goTo };
}
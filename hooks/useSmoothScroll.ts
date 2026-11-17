'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSceneStore } from '@/lib/sceneStore';

/**
 * Free, native scrolling. The page is `count` viewport-heights tall; scroll position maps to a
 * float section index (0 … count-1). A frame loop eases toward it so the 3D box glides, and the
 * eased value is written to the scene store (read by the 3D scene and the text overlay).
 */
export function useSmoothScroll(count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let current = 0;
    let written = -1;
    let act = 0;
    let last = performance.now();
    let raf = 0;

    const read = () => {
      target = Math.min(Math.max(window.scrollY / window.innerHeight, 0), count - 1);
    };
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      current = reduce ? target : current + (target - current) * (1 - Math.exp(-7 * dt));
      if (Math.abs(target - current) < 0.0005) current = target;
      if (current !== written) {
        written = current;
        useSceneStore.getState().setProgress(current);
      }
      const a = Math.round(current);
      if (a !== act) {
        act = a;
        setActive(a);
      }
      raf = requestAnimationFrame(tick);
    };

    read();
    current = target;
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      useSceneStore.getState().setProgress(0);
    };
  }, [count]);

  const goTo = useCallback((i: number) => {
    window.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' });
  }, []);

  return { active, goTo };
}

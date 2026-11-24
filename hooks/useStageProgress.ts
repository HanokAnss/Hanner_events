import { useCallback, useState, type RefObject } from 'react';
import { useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useSceneStore } from '@/lib/sceneStore';
import { KEYS, STEPS } from '@/lib/timeline';

/** Scroll position inside the tall stage wrapper -> spring-smoothed stage time t (0 … STEPS). */
export function useStageProgress(stage: RefObject<HTMLElement>) {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, STEPS]);
  const t = useSpring(raw, { stiffness: 85, damping: 22, mass: 0.9, restDelta: 0.0005 });

  useMotionValueEvent(t, 'change', (v) => {
    useSceneStore.getState().setProgress(v);
    const a = Math.min(Math.max(Math.round(v), 0), KEYS.length - 1);
    setActive((p) => (p === a ? p : a));
  });

  const goTo = useCallback((i: number) => {
    const el = stage.current;
    if (el) window.scrollTo({ top: el.offsetTop + i * window.innerHeight, behavior: 'smooth' });
  }, [stage]);

  return { t, active, goTo };
}

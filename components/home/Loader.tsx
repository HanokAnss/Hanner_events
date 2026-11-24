'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { BRAND_WORD } from '@/lib/poses';
import { SECTIONS } from '@/lib/sections';
import { useSceneStore } from '@/lib/sceneStore';

const FACES = SECTIONS.filter((s) => s.kind === 'event').map((s) => s.accent);
const MIN_MS = 1800; // always show the loader long enough to read as a deliberate intro

/** Full-screen intro: a spinning four-faced cube, wordmark and progress bar. Lifts away when the 3D model is ready. */
export default function Loader() {
  const { progress } = useProgress();
  const ready = useSceneStore((s) => s.ready);
  const [minDone, setMinDone] = useState(false);
  const [open, setOpen] = useState(true);
  const [pct, setPct] = useState(0);
  const value = useMotionValue(0);
  const scaleX = useTransform(value, [0, 100], [0, 1]);
  useMotionValueEvent(value, 'change', (v) => setPct(Math.round(v)));

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden'; // no scrolling until the intro is done
    const id = setTimeout(() => setMinDone(true), MIN_MS);
    return () => clearTimeout(id);
  }, []);

  const done = ready && minDone;
  useEffect(() => {
    const target = done ? 100 : Math.min(88, Math.max(progress * 0.88, 14));
    const c = animate(value, target, { duration: done ? 0.5 : 0.9, ease: 'easeOut' });
    return () => c.stop();
  }, [done, progress, value]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setOpen(false), 650);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = '';
      }}
    >
      {open && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-[#0e0c1d]"
          exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          onAnimationStart={(d) => {
            if (typeof d === 'object' && 'y' in d) useSceneStore.getState().setRevealed(true);
          }}
        >
          <div className="l-scene" aria-hidden>
            <div className="l-cube">
              {FACES.map((c, i) => (
                <span key={i} className="l-face" style={{ ['--c' as string]: c, transform: `rotateY(${i * 90}deg) translateZ(48px)` }} />
              ))}
              <span className="l-face" style={{ ['--c' as string]: '#ffffff', transform: 'rotateX(90deg) translateZ(48px)' }} />
              <span className="l-face" style={{ ['--c' as string]: '#ffffff', transform: 'rotateX(-90deg) translateZ(48px)' }} />
            </div>
          </div>

          <div className="text-center">
            <p className="font-display text-xl uppercase tracking-[0.4em] text-white">{BRAND_WORD}</p>
            <p className="mt-3 text-sm text-white/50">Setting the stage</p>
          </div>

          <div className="w-[min(18rem,70vw)]">
            <div className="h-px w-full bg-white/15">
              <motion.div className="h-px origin-left bg-[#ff9f5a]" style={{ scaleX }} />
            </div>
            <p className="mt-3 text-right font-display text-xs tabular-nums text-white/60">{pct}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

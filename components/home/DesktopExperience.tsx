'use client';

import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion';
import { SECTIONS, type Section } from '@/lib/sections';
import { textSide } from '@/lib/poses';
import { sampleRgb } from '@/lib/color';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import SceneCanvas from '@/components/three/SceneCanvas';
import Particles from '@/components/ui/Particles';
import ScrollRail from '@/components/ui/ScrollRail';
import SectionContent from './SectionContent';
import Navbar from './Navbar';
import Logo from './Logo';

const IDX = SECTIONS.map((_, i) => i);
const ACCENTS = SECTIONS.map((s) => s.accent);

/** One section's text. It fades, blurs and slides as the scroll progress moves through it. */
function Layer({ s, i, progress }: { s: Section; i: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i - 0.7, i - 0.3, i + 0.3, i + 0.7], [0, 1, 1, 0]);
  const y = useTransform(progress, [i - 1, i, i + 1], [70, 0, -70]);
  const blur = useTransform(progress, [i - 0.7, i - 0.3, i + 0.3, i + 0.7], [10, 0, 0, 10]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? ('auto' as const) : ('none' as const)));
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? ('visible' as const) : ('hidden' as const)));
  const left = textSide(i) === 'left';

  return (
    <div className={`pointer-events-none absolute inset-y-0 flex w-[min(32rem,40vw)] items-center ${left ? 'left-[6vw]' : 'right-[9vw]'}`}>
      <motion.div style={{ opacity, y, filter, pointerEvents, visibility }}>
        <SectionContent s={s} as={i === 0 ? 'h1' : 'h2'} />
      </motion.div>
    </div>
  );
}

export default function DesktopExperience() {
  const { progress, active, goTo } = useSectionProgress(SECTIONS.length);
  const bg = useTransform(progress, IDX, SECTIONS.map((s) => s.bg));
  const accent = useTransform(progress, IDX, ACCENTS);
  const getProgress = useCallback(() => progress.get(), [progress]);
  const getColor = useCallback(() => sampleRgb(ACCENTS, progress.get()), [progress]);

  // Keep the cursor and scrollbar colours in step with the theme.
  useMotionValueEvent(accent, 'change', (v) => document.documentElement.style.setProperty('--ui-accent', v));

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('immersive'); // hides the native scrollbar; ScrollRail replaces it
    el.style.setProperty('--ui-accent', accent.get());
    // Arriving from another page with /#church etc. jumps straight to that section.
    const i = SECTIONS.findIndex((s) => s.id === window.location.hash.slice(1));
    if (i > 0) window.scrollTo({ top: i * window.innerHeight });
    return () => {
      el.classList.remove('immersive');
      el.style.removeProperty('--ui-accent');
    };
  }, [accent]);

  return (
    <>
      {/* Gives the page its scroll length: one viewport per section. */}
      <div aria-hidden style={{ height: `${SECTIONS.length * 100}vh` }} />

      <motion.div
        className="fixed inset-0 overflow-hidden text-white"
        style={
          {
            '--bg': bg,
            '--accent': accent,
            background: 'radial-gradient(55% 70% at 74% 52%, color-mix(in srgb, var(--accent) 26%, var(--bg)) 0%, var(--bg) 100%)',
          } as MotionStyle
        }
      >
        <Particles getProgress={getProgress} getColor={getColor} />
        <div className="absolute inset-0">
          <SceneCanvas />
        </div>

        <motion.header
          className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-[4vw] py-5"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Logo />
          <Navbar active={active} onSelect={goTo} />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link href="/plan" className="block rounded-full border border-white/25 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white/10">
              Plan an event
            </Link>
          </motion.div>
        </motion.header>

        <main className="pointer-events-none absolute inset-0 z-10">
          {SECTIONS.map((s, i) => (
            <Layer key={s.id} s={s} i={i} progress={progress} />
          ))}
        </main>

        <ScrollRail active={active} onSelect={goTo} />

        <AnimatePresence>
          {active === 0 && (
            <motion.div
              className="absolute bottom-7 left-[6vw] z-10 flex items-center gap-3 text-sm text-white/60"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              <span className="relative h-9 w-6 rounded-full border border-white/40">
                <motion.span
                  className="absolute left-[9px] top-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </span>
              Scroll to turn the box
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { motion, useInView, useMotionTemplate, useMotionValueEvent, useTransform, type MotionStyle, type MotionValue } from 'framer-motion';
import { SECTIONS, type Section } from '@/lib/sections';
import { EVENTS, KEYS, STAGE_VH } from '@/lib/timeline';
import { sampleRgb } from '@/lib/color';
import { useSceneStore } from '@/lib/sceneStore';
import { useStageProgress } from '@/hooks/useStageProgress';
import SceneCanvas from '@/components/three/SceneCanvas';
import Particles from '@/components/ui/Particles';
import Loader from './Loader';
import Header from './Header';
import Sections from './Sections';

const IDX = KEYS.map((_, i) => i);
const ACCENTS = KEYS.map((k) => k.accent);

/** One caption. It fades, blurs and slides as scroll time t passes through its window. */
function Caption({ s, win, label, hero, t }: { s: Section; win: number[]; label?: string; hero?: boolean; t: MotionValue<number> }) {
  const opacity = useTransform(t, win, [0, 1, 1, 0]);
  const y = useTransform(t, [win[0], win[1], win[2], win[3]], [50, 0, 0, -50]);
  const blur = useTransform(t, win, [10, 0, 0, 10]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? ('auto' as const) : ('none' as const)));
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? ('visible' as const) : ('hidden' as const)));
  const H = hero ? 'h1' : 'h2';
  const href = s.eventType ? `/plan?type=${s.eventType}` : '/plan';

  return (
    <div className="pointer-events-none absolute inset-x-6 bottom-12 sm:inset-x-[6vw] lg:inset-x-auto lg:bottom-auto lg:left-[6vw] lg:top-1/2 lg:w-[min(32rem,40vw)] lg:-translate-y-1/2">
      <motion.div style={{ opacity, y, filter, pointerEvents, visibility }}>
        {label && <p className="mb-4 font-display text-xs tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{label}</p>}
        <H className="font-display text-3xl leading-[1.08] sm:text-4xl xl:text-5xl">{s.title}</H>
        <p className="mt-4 max-w-[38ch] text-base text-white/75 sm:text-lg">{s.blurb}</p>
        {s.points.length > 0 && (
          <ul className="mt-5 hidden space-y-2 text-white/85 lg:block">
            {s.points.map((p) => (
              <li key={p} className="flex gap-3"><span aria-hidden className="mt-3 h-px w-5 shrink-0" style={{ background: 'var(--accent)' }} />{p}</li>
            ))}
          </ul>
        )}
        <Link href={href} className="mt-6 inline-flex rounded-full px-6 py-3 font-semibold text-[#14121f] transition-transform hover:scale-[1.03]" style={{ background: 'var(--accent)' }}>
          {s.cta}
        </Link>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.01 });
  const { t, active, goTo } = useStageProgress(wrap);
  const revealed = useSceneStore((s) => s.revealed);

  const bg = useTransform(t, IDX, KEYS.map((k) => k.bg));
  const accent = useTransform(t, IDX, ACCENTS);
  const getProgress = useCallback(() => t.get(), [t]);
  const getColor = useCallback(() => sampleRgb(ACCENTS, t.get()), [t]);
  const hintOpacity = useTransform(t, [0, 0.4], [1, 0]);

  useMotionValueEvent(accent, 'change', (v) => document.documentElement.style.setProperty('--ui-accent', v));
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-accent', accent.get());
    const i = window.location.hash.slice(1);
    if (i && document.getElementById(i)) setTimeout(() => document.getElementById(i)?.scrollIntoView(), 0);
  }, [accent]);

  return (
    <>
      <Loader />
      <Header />

      {/* Tall wrapper = the scroll length of the pinned stage. */}
      <div ref={wrap} style={{ height: `${STAGE_VH}vh` }}>
        <motion.div
          ref={stage}
          className="sticky top-0 h-screen overflow-hidden text-white"
          style={{ '--bg': bg, '--accent': accent, background: 'radial-gradient(55% 70% at 70% 52%, color-mix(in srgb, var(--accent) 26%, var(--bg)) 0%, var(--bg) 100%)' } as MotionStyle}
        >
          <Particles getProgress={getProgress} getColor={getColor} />
          <div className="absolute inset-0"><SceneCanvas running={inView} /></div>

          <motion.div className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: revealed ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
            {EVENTS.map((s, i) => (
              <Caption key={s.id} s={s} t={t} label={`0${i + 1} / 0${EVENTS.length}`} win={[i - 0.55, i - 0.25, i + 0.3, i + 0.6]} />
            ))}
            <Caption s={SECTIONS[0]} t={t} hero win={[4.4, 5, 6, 6.6]} />

            {/* Step dots */}
            <nav aria-label="Event sections" className="absolute right-[3vw] top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex">
              {EVENTS.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} aria-label={s.nav} aria-current={active === i} className="group flex items-center justify-end gap-3">
                  <span className="text-xs text-white/0 transition-colors group-hover:text-white/70">{s.nav}</span>
                  <span className="h-2.5 w-2.5 rounded-full border border-white/50 transition-all" style={active === i ? { background: 'var(--accent)', borderColor: 'var(--accent)', transform: 'scale(1.35)' } : undefined} />
                </button>
              ))}
            </nav>

            <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm text-white/60 lg:left-[6vw] lg:translate-x-0">
              <span className="relative h-9 w-6 rounded-full border border-white/40">
                <motion.span className="absolute left-[9px] top-2 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
              </span>
              Scroll to turn the box
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <Sections />
    </>
  );
}

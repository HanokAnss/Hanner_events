'use client';

import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';

/**
 * Replaces the native scrollbar on the 3D home page. A glowing thumb rides a track, stretches with
 * scroll speed, and the section dots are clickable (smooth-scroll to that section).
 */
export default function ScrollRail({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const { scrollY, scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const speed = useVelocity(scrollY);
  const stretch = useTransform(speed, (v) => 1 + Math.min(Math.abs(v) / 2200, 1.4));
  const top = useTransform(p, [0, 1], ['0%', '100%']);
  const last = SECTIONS.length - 1;

  return (
    <nav aria-label="Sections" className="fixed right-5 top-1/2 z-20 h-[46vh] w-6 -translate-y-1/2">
      <div className="absolute inset-y-0 left-[11px] w-px bg-white/20" />
      <motion.div className="absolute left-[11px] top-0 h-full w-px origin-top" style={{ scaleY: p, background: 'var(--accent)' }} />
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={s.nav}
          aria-current={i === active}
          className="group absolute left-0 flex h-6 w-6 items-center justify-center"
          style={{ top: `calc(${(i / last) * 100}% - 12px)` }}
        >
          <motion.span
            className="block h-[7px] w-[7px] rounded-full transition-colors duration-300"
            style={{ background: i <= active ? 'var(--accent)' : 'rgba(255,255,255,0.35)' }}
            animate={{ scale: active === i ? 1.7 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
          <span className="pointer-events-none absolute right-9 translate-x-2 whitespace-nowrap rounded-md bg-black/60 px-2 py-1 text-xs opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
            {s.nav}
          </span>
        </button>
      ))}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[5px] h-[14px] w-[14px] rounded-full"
        style={{ top, y: '-50%', scaleY: stretch, background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)' }}
      />
    </nav>
  );
}
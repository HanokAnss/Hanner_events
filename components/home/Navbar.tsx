'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { LayoutGroup, motion, useScroll, useSpring } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';

// "All" (the intro) plus each service. The final "Plan" section has its own button instead.
const ITEMS = SECTIONS.filter((s) => s.kind !== 'cta');
const base = 'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold';

function Pill({ on }: { on: boolean }) {
  if (!on) return null;
  // Shared layoutId: the highlight slides between items on a spring instead of jumping.
  return (
    <motion.span
      layoutId="nav-pill"
      className="absolute inset-0 rounded-full"
      style={{ background: 'var(--accent)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    />
  );
}

/**
 * Animated top navigation. With `onSelect` it renders buttons (home page: scrolls to that section);
 * without it, links to /#id (planner page and mobile). A thin bar along the bottom shows page progress,
 * and on narrow screens the active item is scrolled into the middle.
 */
export default function Navbar({ active, onSelect }: { active?: number; onSelect?: (i: number) => void }) {
  const nav = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  useEffect(() => {
    const n = nav.current;
    const el = n?.querySelectorAll<HTMLElement>('[data-nav]')[active ?? 0];
    if (n && el && n.scrollWidth > n.clientWidth) {
      n.scrollTo({ left: el.offsetLeft - (n.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <LayoutGroup id="nav">
      <motion.div
        className="relative max-w-full overflow-hidden rounded-full border border-white/15 bg-black/25 backdrop-blur"
        initial={{ y: -20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
      >
        <nav
          ref={nav}
          aria-label="Event services"
          className="relative flex gap-1 overflow-x-auto p-1 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ITEMS.map((s, i) => {
            const on = active === i;
            const inner = (
              <>
                <Pill on={on} />
                <span className={`relative z-10 transition-colors duration-300 ${on ? 'text-[#14121f]' : 'text-white/80'}`}>{s.nav}</span>
              </>
            );
            return onSelect ? (
              <motion.button
                key={s.id}
                data-nav
                type="button"
                onClick={() => onSelect(i)}
                aria-current={on ? 'true' : undefined}
                className={base}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
              >
                {inner}
              </motion.button>
            ) : (
              <motion.div key={s.id} data-nav className="relative" whileHover={{ y: -1 }} whileTap={{ scale: 0.94 }}>
                <Link href={`/#${s.id}`} aria-current={on ? 'true' : undefined} className={`${base} block`}>
                  {inner}
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] origin-left rounded-full"
          style={{ scaleX: bar, background: 'var(--accent)' }}
        />
      </motion.div>
    </LayoutGroup>
  );
}
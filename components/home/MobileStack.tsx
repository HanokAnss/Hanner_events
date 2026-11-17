'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';
import { sampleRgb } from '@/lib/color';
import Particles from '@/components/ui/Particles';
import SectionContent from './SectionContent';
import MobileCube from './MobileCube';
import Navbar from './Navbar';
import Logo from './Logo';

const STOPS = SECTIONS.map((_, i) => i / (SECTIONS.length - 1));
const ACCENTS = SECTIONS.map((s) => s.accent);

/**
 * Small-screen layout: no WebGL. Native scrolling, a sticky animated top bar, a scroll-tinted
 * background with lighter particles, and each section eases in as it scrolls into view.
 */
export default function MobileStack() {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll();
  const bg = useTransform(scrollYProgress, STOPS, SECTIONS.map((s) => s.bg));
  const accent = useTransform(scrollYProgress, STOPS, ACCENTS);
  const getProgress = useCallback(() => scrollYProgress.get() * (SECTIONS.length - 1), [scrollYProgress]);
  const getColor = useCallback(() => sampleRgb(ACCENTS, getProgress()), [getProgress]);

  useEffect(() => {
    const i = SECTIONS.findIndex((s) => s.id === window.location.hash.slice(1));
    if (i > 0) document.getElementById(SECTIONS[i].id)?.scrollIntoView();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(SECTIONS.findIndex((s) => s.id === e.target.id));
        }),
      { threshold: 0.5 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <motion.div className="relative text-white" style={{ '--bg': bg, '--accent': accent } as MotionStyle}>
      <div className="fixed inset-0" style={{ background: 'linear-gradient(165deg, var(--bg) 0%, #14121f 100%)' }} />
      <Particles getProgress={getProgress} getColor={getColor} density={0.55} />

      <motion.header
        className="sticky top-0 z-30 bg-[#14121f]/70 px-4 pb-3 pt-4 backdrop-blur"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <Logo />
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link href="/plan" className="block rounded-full border border-white/25 px-4 py-2 text-sm font-semibold">
              Plan
            </Link>
          </motion.div>
        </div>
        <Navbar active={active} />
      </motion.header>

      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className="relative z-10 flex min-h-[85svh] scroll-mt-28 flex-col justify-center px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.35 }}
            transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {i === 0 && <MobileCube />}
            {i === SECTIONS.length - 1 && <MobileCube flipped />}
            <SectionContent s={s} as={i === 0 ? 'h1' : 'h2'} />
          </motion.div>
        </section>
      ))}
    </motion.div>
  );
}
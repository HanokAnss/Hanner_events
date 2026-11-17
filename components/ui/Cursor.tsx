'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Mode = 'idle' | 'link' | 'text';

/**
 * Custom cursor for mouse devices only: a sharp dot that follows instantly and a ring that trails on a
 * spring. The ring swells over clickable things, squeezes on press and steps aside over text fields.
 * Colour comes from --ui-accent, which the pages keep in sync with the current theme.
 */
export default function Cursor() {
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [down, setDown] = useState(false);
  const [shown, setShown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 240, damping: 24, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 240, damping: 24, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setOn(true);
    document.body.classList.add('has-cursor');

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      const t = e.target as Element | null;
      setMode(
        t?.closest('input,textarea')
          ? 'text'
          : t?.closest('a,button,select,label,summary,[role="radio"],[data-cursor="hover"]')
            ? 'link'
            : 'idle',
      );
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    const leave = () => setShown(false);
    const enter = () => setShown(true);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', dn);
    window.addEventListener('mouseup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', dn);
      window.removeEventListener('mouseup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      document.body.classList.remove('has-cursor');
    };
  }, [x, y]);

  if (!on) return null;
  const hide = !shown || mode === 'text';

  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ x: rx, y: ry }}>
        <motion.div
          className="-ml-5 -mt-5 h-10 w-10 rounded-full border-[1.5px]"
          style={{ borderColor: 'var(--ui-accent)' }}
          animate={{
            scale: down ? 0.7 : mode === 'link' ? 1.7 : 1,
            opacity: hide ? 0 : 1,
            backgroundColor: mode === 'link' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        />
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ x, y }}>
        <motion.div
          className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--ui-accent)' }}
          animate={{ scale: mode === 'link' ? 0 : down ? 1.8 : 1, opacity: hide ? 0 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      </motion.div>
    </>
  );
}
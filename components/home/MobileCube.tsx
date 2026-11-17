'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { BRAND_WORD } from '@/lib/poses';

/**
 * Phone stand-in for the 3D box (WebGL is not loaded on small screens): a floating isometric cube that
 * sways with scroll. With `flipped` it turns upside down when it scrolls into view and shows the brand word.
 */
export default function MobileCube({ flipped = false }: { flipped?: boolean }) {
  const { scrollYProgress } = useScroll();
  const sway = useTransform(scrollYProgress, [0, 1], [-14, 14]);

  return (
    <div className="mb-8 flex items-center gap-5">
      <motion.svg
        viewBox="0 0 120 120"
        aria-hidden
        className="h-24 w-24 shrink-0"
        style={{ rotate: sway }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.g
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: flipped ? -1 : 1 }}
          viewport={{ amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.2 }}
        >
          <polygon points="60,10 105,35 60,60 15,35" fill="var(--accent)" />
          <polygon points="15,35 60,60 60,112 15,87" fill="var(--accent)" fillOpacity="0.6" />
          <polygon points="105,35 60,60 60,112 105,87" fill="var(--accent)" fillOpacity="0.35" />
        </motion.g>
      </motion.svg>
      {flipped && (
        <motion.p
          className="font-display text-xl leading-tight"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.6 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {BRAND_WORD}
        </motion.p>
      )}
    </div>
  );
}
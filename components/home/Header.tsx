'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LINKS = [
  { href: '#events', label: 'Events' },
  { href: '#how', label: 'How it works' },
  { href: '#start', label: 'Get started' },
];

export default function Header() {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 bg-gradient-to-b from-[#0e0c1d]/70 to-transparent px-[5vw] py-4 text-white"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <Logo />
      <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-white/75 md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
        ))}
      </nav>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        <Link href="/plan" className="block rounded-full border border-white/25 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white/10">
          Plan an event
        </Link>
      </motion.div>
    </motion.header>
  );
}

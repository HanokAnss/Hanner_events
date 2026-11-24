'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EVENTS } from '@/lib/timeline';
import { BRAND_WORD } from '@/lib/poses';

const rise = { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const } };

const STEPS = [
  { n: '01', t: 'Choose', d: 'Pick the event, the headcount and the services you need: sound, lights, food, decor.' },
  { n: '02', t: 'See the plan', d: 'You see the crew and the price before you pay. No surprises on the day.' },
  { n: '03', t: 'Pay your way', d: 'Pay by card or UPI, or settle in cash on the day. Planning takes about three minutes.' },
];

export default function Sections() {
  return (
    <div className="relative bg-[#0e0c1d] text-white">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-gradient-to-b from-transparent to-[#0e0c1d]" />

      <section id="events" className="mx-auto max-w-7xl scroll-mt-24 px-[5vw] py-28">
        <motion.p {...rise} className="text-sm uppercase tracking-[0.3em] text-[#ff9f5a]">What we run</motion.p>
        <motion.h2 {...rise} className="mt-4 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">Four kinds of night. One crew that sets them up.</motion.h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {EVENTS.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7"
              style={{ ['--c' as string]: s.accent }}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: s.accent }} />
              <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: s.accent }} />
              <span className="font-display text-sm" style={{ color: s.accent }}>0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-3 text-white/70">{s.blurb}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0" style={{ background: s.accent }} />{p}</li>
                ))}
              </ul>
              <Link href={`/plan?type=${s.eventType}`} className="mt-auto pt-8 text-sm font-semibold" style={{ color: s.accent }}>
                {s.cta} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-[5vw] py-24">
        <motion.p {...rise} className="text-sm uppercase tracking-[0.3em] text-[#ff9f5a]">How it works</motion.p>
        <motion.h2 {...rise} className="mt-4 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">From idea to booked in three steps.</motion.h2>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li key={s.n} {...rise} transition={{ ...rise.transition, delay: i * 0.1 }} className="bg-[#0e0c1d] p-8 sm:p-10">
              <span className="font-display text-5xl text-white/15">{s.n}</span>
              <h3 className="mt-6 font-display text-xl">{s.t}</h3>
              <p className="mt-3 text-white/70">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section id="start" className="relative mx-auto max-w-7xl scroll-mt-24 px-[5vw] pb-28 pt-12">
        <motion.div {...rise} className="relative overflow-hidden rounded-[2rem] border border-white/10 px-8 py-20 text-center sm:px-16" style={{ background: 'radial-gradient(60% 120% at 50% 0%, rgba(255,159,90,0.22), rgba(22,19,42,0.9))' }}>
          <h2 className="font-display text-4xl leading-tight sm:text-6xl">Ready when you are.</h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/75">It takes about three minutes. Pay by card or UPI, or settle in cash on the day.</p>
          <motion.div className="mt-10 inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/plan" className="inline-flex rounded-full bg-[#ff9f5a] px-8 py-4 font-semibold text-[#14121f]">Start planning</Link>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-[5vw] py-10 text-sm text-white/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <span className="font-display text-white/80">{BRAND_WORD}</span>
          <span>Concerts, parties, church and community gatherings.</span>
        </div>
      </footer>
    </div>
  );
}

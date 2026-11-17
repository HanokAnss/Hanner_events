import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import SectionContent from './SectionContent';
import Logo from './Logo';

/** Small-screen layout: plain stacked sections with native scrolling and no WebGL. */
export default function MobileStack() {
  return (
    <div className="text-white">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5" style={{ '--accent': '#ff9f5a' } as CSSProperties}>
        <Logo />
        <Link href="/plan" className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold">
          Plan
        </Link>
      </header>
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          className="flex min-h-[88svh] flex-col justify-center px-6 py-20"
          style={{ background: `linear-gradient(165deg, ${s.bg} 0%, #14121f 100%)`, '--accent': s.accent } as CSSProperties}
        >
          <SectionContent s={s} as={i === 0 ? 'h1' : 'h2'} />
        </section>
      ))}
    </div>
  );
}

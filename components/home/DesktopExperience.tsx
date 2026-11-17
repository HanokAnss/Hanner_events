'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { SECTIONS } from '@/lib/sections';
import { sampleColors } from '@/lib/color';
import { useSceneStore } from '@/lib/sceneStore';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import SceneCanvas from '@/components/three/SceneCanvas';
import SectionContent from './SectionContent';
import NavDots from './NavDots';
import Logo from './Logo';

export default function DesktopExperience() {
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const { active, goTo } = useSmoothScroll(SECTIONS.length);

  // Colours and the text of every section follow the eased scroll progress, frame by frame.
  useEffect(() => {
    const apply = (p: number) => {
      const el = root.current;
      if (!el) return;
      el.style.setProperty('--bg', sampleColors(SECTIONS.map((s) => s.bg), p));
      el.style.setProperty('--accent', sampleColors(SECTIONS.map((s) => s.accent), p));
      items.current.forEach((it, i) => {
        if (!it) return;
        const d = i - p;
        const o = Math.max(0, 1 - Math.abs(d) * 1.7);
        it.style.opacity = String(o);
        it.style.transform = `translateY(${d * 48}px)`;
        it.style.visibility = o > 0 ? 'visible' : 'hidden';
        it.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
    };
    apply(useSceneStore.getState().progress);
    return useSceneStore.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <>
      {/* Gives the page its scroll length: one viewport per section. */}
      <div aria-hidden style={{ height: `${SECTIONS.length * 100}vh` }} />

      <div
        ref={root}
        className="fixed inset-0 overflow-hidden text-white"
        style={{
          background:
            'radial-gradient(55% 70% at 74% 52%, color-mix(in srgb, var(--accent) 26%, var(--bg)) 0%, var(--bg) 100%)',
        }}
      >
        <div className="absolute inset-0">
          <SceneCanvas />
        </div>

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-[4vw] py-6">
          <Logo />
          <Link href="/plan" className="rounded-full border border-white/25 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white/10">
            Plan an event
          </Link>
        </header>

        <main className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-y-0 left-[6vw] grid w-[min(32rem,42vw)] items-center">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                ref={(el) => { items.current[i] = el; }}
                className="col-start-1 row-start-1"
                style={i === 0 ? undefined : { opacity: 0, visibility: 'hidden' }}
              >
                <SectionContent s={s} as={i === 0 ? 'h1' : 'h2'} />
              </div>
            ))}
          </div>
        </main>

        <NavDots active={active} onSelect={goTo} />

        {active === 0 && <p className="absolute bottom-7 left-[6vw] z-10 text-sm text-white/55">Scroll to turn the box.</p>}
      </div>
    </>
  );
}

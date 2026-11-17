import Link from 'next/link';
import type { Section } from '@/lib/sections';

export default function SectionContent({ s, as: H = 'h2' }: { s: Section; as?: 'h1' | 'h2' }) {
  const href = s.eventType ? `/plan?type=${s.eventType}` : '/plan';
  return (
    <div>
      <H className="font-display text-3xl leading-[1.08] sm:text-4xl xl:text-5xl">{s.title}</H>
      <p className="mt-5 max-w-[36ch] text-lg text-white/75">{s.blurb}</p>
      {s.points.length > 0 && (
        <ul className="mt-6 space-y-2.5 text-white/85">
          {s.points.map((p) => (
            <li key={p} className="flex gap-3">
              <span aria-hidden className="mt-3 h-px w-5 shrink-0" style={{ background: 'var(--accent)' }} />
              {p}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={href}
        className="mt-8 inline-flex items-center rounded-full px-6 py-3 font-semibold text-[#14121f] transition-transform hover:scale-[1.03]"
        style={{ background: 'var(--accent)' }}
      >
        {s.cta}
      </Link>
    </div>
  );
}

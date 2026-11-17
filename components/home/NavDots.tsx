import { SECTIONS } from '@/lib/sections';

export default function NavDots({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Sections" className="fixed right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-4">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={s.nav}
          aria-current={i === active}
          className="group relative flex h-4 w-4 items-center justify-center"
        >
          <span
            className="block rounded-full transition-all"
            style={{
              width: i === active ? 12 : 7,
              height: i === active ? 12 : 7,
              background: i === active ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
            }}
          />
          <span className="pointer-events-none absolute right-7 whitespace-nowrap rounded-md bg-black/60 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {s.nav}
          </span>
        </button>
      ))}
    </nav>
  );
}

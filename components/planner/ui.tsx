import type { ReactNode } from 'react';

export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ');

export const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-[var(--accent)] focus:outline-none';

export function OptionCard({
  selected, onClick, title, desc, aside,
}: { selected: boolean; onClick: () => void; title: string; desc?: string; aside?: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        'flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-colors',
        selected ? 'border-[var(--accent)] bg-white/10' : 'border-white/12 bg-white/[0.03] hover:bg-white/[0.07]',
      )}
    >
      <span>
        <span className="block font-semibold">{title}</span>
        {desc && <span className="mt-1 block text-sm text-white/60">{desc}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm text-white/70">{aside}</span>}
    </button>
  );
}

export function CheckRow({
  checked, onChange, label, aside,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; aside?: string }) {
  return (
    <label className={cx('flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3', checked ? 'border-[var(--accent)] bg-white/10' : 'border-white/12')}>
      <span className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
        {label}
      </span>
      {aside && <span className="text-sm text-white/60">{aside}</span>}
    </label>
  );
}

export function Field({ label, error, children }: { label: string; error?: string | false; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/70">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-sm text-[#ff8a8a]">{error}</span>}
    </label>
  );
}

export function PrimaryButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="rounded-full px-7 py-3 font-semibold text-[#14121f] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'var(--accent)' }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className="rounded-full border border-white/25 px-6 py-3 font-semibold transition-colors hover:bg-white/10">
      {children}
    </button>
  );
}

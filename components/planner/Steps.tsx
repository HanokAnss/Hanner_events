'use client';

import { useMemo, type ReactNode } from 'react';
import { useBooking } from '@/lib/bookingStore';
import { EVENT_TYPES, GUEST_RANGES } from '@/lib/events';
import { RATES, buildQuote, inr, speakerStacks } from '@/lib/pricing';
import { CheckRow, OptionCard, cx } from './ui';

export function EventStep() {
  const { eventType, setEventType } = useBooking();
  return (
    <div role="radiogroup" aria-label="Event type" className="grid gap-3 sm:grid-cols-2">
      {EVENT_TYPES.map((e) => (
        <OptionCard key={e.id} selected={eventType === e.id} onClick={() => setEventType(e.id)} title={e.label} desc={e.blurb} />
      ))}
    </div>
  );
}

export function GuestStep() {
  const { guestRange, setGuestRange } = useBooking();
  return (
    <div role="radiogroup" aria-label="Expected guests" className="grid gap-3 sm:grid-cols-2">
      {GUEST_RANGES.map((g) => (
        <OptionCard key={g.id} selected={guestRange === g.id} onClick={() => setGuestRange(g.id)} title={`${g.label} guests`} />
      ))}
    </div>
  );
}

function Block({
  title, desc, on, onToggle, crew, children,
}: { title: string; desc: string; on: boolean; onToggle: (v: boolean) => void; crew?: string; children?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{title}</h3>
          <p className="mt-1 text-sm text-white/60">{desc}</p>
        </div>
        <div role="radiogroup" aria-label={`${title}: needed?`} className="flex overflow-hidden rounded-full border border-white/20 text-sm">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={on === v}
              onClick={() => onToggle(v)}
              className={cx('px-4 py-2 font-semibold', on === v && 'text-[#14121f]')}
              style={on === v ? { background: 'var(--accent)' } : undefined}
            >
              {v ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>
      {on && (
        <div className="mt-4 space-y-3">
          {children}
          {crew && <p className="text-sm text-white/65">Crew needed: {crew}</p>}
        </div>
      )}
    </section>
  );
}

export function ServicesStep() {
  const { eventType, guestRange, services, patchServices } = useBooking();
  const quote = useMemo(() => buildQuote(eventType, guestRange, services), [eventType, guestRange, services]);
  const crewFor = (op: string) => {
    const g = quote?.crew.find((c) => c.operation === op);
    return g ? `${g.total} people (${g.roles.map((r) => `${r.count} ${r.role.toLowerCase()}`).join(', ')})` : undefined;
  };
  const { food, dj, decor } = services;
  const stacks = quote ? speakerStacks(quote.guests) : 2;

  return (
    <div className="space-y-4">
      <Block
        title="Food and catering"
        desc="Choose any mix. If you pick both veg and non-veg, guests are split evenly."
        on={food.on}
        onToggle={(on) => patchServices((s) => ({ ...s, food: { ...s.food, on } }))}
        crew={crewFor('Food and catering')}
      >
        <CheckRow checked={food.veg} onChange={(v) => patchServices((s) => ({ ...s, food: { ...s.food, veg: v } }))} label="Vegetarian" aside={`${inr(RATES.vegPerPlate)} / plate`} />
        <CheckRow checked={food.nonVeg} onChange={(v) => patchServices((s) => ({ ...s, food: { ...s.food, nonVeg: v } }))} label="Non-vegetarian" aside={`${inr(RATES.nonVegPerPlate)} / plate`} />
        <CheckRow checked={food.dessert} onChange={(v) => patchServices((s) => ({ ...s, food: { ...s.food, dessert: v } }))} label="Desserts" aside={`${inr(RATES.dessertPerHead)} / guest`} />
        {!food.veg && !food.nonVeg && !food.dessert && <p role="alert" className="text-sm text-[#ff8a8a]">Pick at least one food option, or choose No.</p>}
      </Block>

      <Block
        title="DJ set with speakers"
        desc={`Includes ${stacks} speaker stacks for your headcount.`}
        on={dj.on}
        onToggle={(on) => patchServices((s) => ({ ...s, dj: { ...s.dj, on } }))}
        crew={crewFor('DJ and sound')}
      >
        <div role="radiogroup" aria-label="DJ package" className="grid gap-3 sm:grid-cols-2">
          <OptionCard selected={dj.tier === 'sound'} onClick={() => patchServices((s) => ({ ...s, dj: { ...s.dj, tier: 'sound' } }))} title="DJ and speakers" desc="Booth, DJ and sound." />
          <OptionCard selected={dj.tier === 'full'} onClick={() => patchServices((s) => ({ ...s, dj: { ...s.dj, tier: 'full' } }))} title="Full show" desc="Adds stage lights and fog." />
        </div>
      </Block>

      <Block
        title="Decorations"
        desc="Entrance, stage or altar, tables and lighting."
        on={decor.on}
        onToggle={(on) => patchServices((s) => ({ ...s, decor: { ...s.decor, on } }))}
        crew={crewFor('Decorations')}
      >
        <div role="radiogroup" aria-label="Decoration style" className="grid gap-3 sm:grid-cols-2">
          <OptionCard selected={decor.tier === 'classic'} onClick={() => patchServices((s) => ({ ...s, decor: { ...s.decor, tier: 'classic' } }))} title="Classic" desc="Flowers, drapes, fairy lights." />
          <OptionCard selected={decor.tier === 'premium'} onClick={() => patchServices((s) => ({ ...s, decor: { ...s.decor, tier: 'premium' } }))} title="Premium" desc="Themed set pieces and a lead designer." />
        </div>
      </Block>
    </div>
  );
}

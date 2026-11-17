'use client';

import { useEffect, useMemo } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useBooking } from '@/lib/bookingStore';
import { EVENT_TYPES, GUEST_RANGES } from '@/lib/events';
import { buildQuote, inr } from '@/lib/pricing';

/** Counts smoothly from the old amount to the new one whenever the price changes. */
function Money({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => inr(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.6, ease: 'easeOut' });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

export default function Summary() {
  const { eventType, guestRange, services } = useBooking();
  const quote = useMemo(() => buildQuote(eventType, guestRange, services), [eventType, guestRange, services]);
  const type = EVENT_TYPES.find((e) => e.id === eventType);
  const range = GUEST_RANGES.find((g) => g.id === guestRange);

  return (
    <aside aria-label="Your plan" className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 lg:sticky lg:top-6">
      <h2 className="font-display text-lg">Your plan</h2>
      <p className="mt-3 text-sm text-white/70">
        {type ? type.label : 'No event chosen yet'}
        {range && `, ${range.label} guests`}
      </p>

      {quote ? (
        <>
          <ul className="mt-4 space-y-3 text-sm">
            {quote.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-3">
                <span>
                  {l.label}
                  <span className="block text-xs text-white/50">{l.detail}</span>
                </span>
                <span className="shrink-0">{inr(l.amount)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-white/12 pt-4 text-sm">
            <div className="flex justify-between text-white/70"><dt>Subtotal</dt><dd>{inr(quote.subtotal)}</dd></div>
            <div className="flex justify-between text-white/70"><dt>GST (18%)</dt><dd>{inr(quote.gst)}</dd></div>
            <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd><Money value={quote.total} /></dd></div>
          </dl>
          <p className="mt-4 text-sm text-white/70">
            Crew on the day: <strong className="text-white">{quote.crewTotal} people</strong>
          </p>
          <p className="mt-1 text-xs text-white/45">Planned for the top of your range ({quote.guests} guests).</p>
        </>
      ) : (
        <p className="mt-4 text-sm text-white/50">Pick an event and a headcount to see the price and crew.</p>
      )}
    </aside>
  );
}
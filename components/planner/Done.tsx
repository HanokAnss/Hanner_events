'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useBooking } from '@/lib/bookingStore';
import { EVENT_TYPES } from '@/lib/events';
import { buildQuote, inr } from '@/lib/pricing';
import { GhostButton } from './ui';

export default function Done() {
  const { reference, eventType, guestRange, services, contact, method, reset } = useBooking();
  const quote = useMemo(() => buildQuote(eventType, guestRange, services), [eventType, guestRange, services]);
  const type = EVENT_TYPES.find((e) => e.id === eventType);
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl">You are booked in.</h1>
      <p className="mt-4 text-white/75">
        Reference <strong className="text-white">{reference}</strong>. {type?.label} on {contact.date}.
        {quote && ` ${quote.crewTotal} crew will be there.`}
      </p>
      <p className="mt-2 text-white/75">
        {method === 'cash' ? `Pay ${quote ? inr(quote.total) : ''} in cash to our event manager on the day.` : `${quote ? inr(quote.total) : ''} paid (demo).`}
      </p>
      <p className="mt-2 text-sm text-white/50">We will call {contact.phone} to confirm the details.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full border border-white/25 px-6 py-3 font-semibold hover:bg-white/10">Back to home</Link>
        <GhostButton type="button" onClick={reset}>Plan another</GhostButton>
      </div>
    </div>
  );
}

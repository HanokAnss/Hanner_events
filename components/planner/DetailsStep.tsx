'use client';

import { useMemo } from 'react';
import { useBooking } from '@/lib/bookingStore';
import { buildQuote } from '@/lib/pricing';
import { validDate, validEmail, validName, validPhone } from '@/lib/validators';
import { Field, inputClass } from './ui';

export function detailsValid(c: { name: string; phone: string; email: string; date: string }) {
  return validName(c.name) && validPhone(c.phone) && validEmail(c.email) && validDate(c.date);
}

export default function DetailsStep({ tried }: { tried: boolean }) {
  const { contact, setContact, eventType, guestRange, services } = useBooking();
  const quote = useMemo(() => buildQuote(eventType, guestRange, services), [eventType, guestRange, services]);
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={tried && !validName(contact.name) && 'Enter your name.'}>
          <input className={inputClass} value={contact.name} autoComplete="name" onChange={(e) => setContact({ name: e.target.value })} />
        </Field>
        <Field label="Mobile number" error={tried && !validPhone(contact.phone) && 'Enter a 10-digit Indian mobile number.'}>
          <input className={inputClass} value={contact.phone} inputMode="numeric" autoComplete="tel" maxLength={10} onChange={(e) => setContact({ phone: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <Field label="Email" error={tried && !validEmail(contact.email) && 'Enter a valid email address.'}>
          <input className={inputClass} type="email" value={contact.email} autoComplete="email" onChange={(e) => setContact({ email: e.target.value })} />
        </Field>
        <Field label="Event date" error={tried && !validDate(contact.date) && 'Pick a date from tomorrow onwards.'}>
          <input className={inputClass} type="date" min={minDate} value={contact.date} onChange={(e) => setContact({ date: e.target.value })} />
        </Field>
      </div>

      {quote && (
        <section aria-label="Crew breakdown">
          <h3 className="font-display text-lg">Who we send ({quote.crewTotal} people)</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quote.crew.map((g) => (
              <div key={g.operation} className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                <p className="flex justify-between font-semibold">
                  {g.operation}
                  <span className="text-white/70">{g.total}</span>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/65">
                  {g.roles.map((r) => (
                    <li key={r.role} className="flex justify-between"><span>{r.role}</span><span>{r.count}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useBooking } from '@/lib/bookingStore';
import { buildQuote, inr } from '@/lib/pricing';
import { luhn, validExpiry, validName, validUpi } from '@/lib/validators';
import type { PaymentMethod } from '@/lib/events';
import { Field, GhostButton, OptionCard, PrimaryButton, inputClass } from './ui';

const METHODS: { id: PaymentMethod; title: string; desc: string }[] = [
  { id: 'card', title: 'Debit or credit card', desc: 'Visa, Mastercard, RuPay.' },
  { id: 'upi', title: 'UPI', desc: 'Pay with your UPI ID.' },
  { id: 'cash', title: 'Pay later in cash', desc: 'Nothing to pay now. Pay our event manager on the day.' },
];

const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
const fmtExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function PaymentStep() {
  const { method, setMethod, setStep, complete, eventType, guestRange, services } = useBooking();
  const quote = useMemo(() => buildQuote(eventType, guestRange, services), [eventType, guestRange, services]);
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [upi, setUpi] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  const digits = card.number.replace(/\s/g, '');
  const errors = {
    number: !luhn(digits) && 'Check the card number.',
    name: !validName(card.name) && 'Enter the name on the card.',
    expiry: !validExpiry(card.expiry) && 'Use a future date as MM/YY.',
    cvc: !/^\d{3,4}$/.test(card.cvc) && 'Enter the 3 or 4 digit code.',
    upi: !validUpi(upi) && 'Enter a UPI ID like name@bank.',
  };
  const ok = method === 'cash' || (method === 'upi' && !errors.upi) || (method === 'card' && !errors.number && !errors.name && !errors.expiry && !errors.cvc);

  const confirm = () => {
    setTried(true);
    if (!ok) return;
    setBusy(true);
    // DEMO ONLY: no payment is taken. Replace this timeout with a real gateway call
    // (e.g. Razorpay or Stripe) from a server route, never send raw card data from here.
    window.setTimeout(() => {
      setCard({ number: '', name: '', expiry: '', cvc: '' });
      setUpi('');
      complete();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
        {METHODS.map((m) => (
          <OptionCard key={m.id} selected={method === m.id} onClick={() => setMethod(m.id)} title={m.title} desc={m.desc} />
        ))}
      </div>

      {method === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Card number" error={tried && errors.number}>
              <input className={inputClass} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Name on card" error={tried && errors.name}>
              <input className={inputClass} autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            </Field>
          </div>
          <Field label="Expiry (MM/YY)" error={tried && errors.expiry}>
            <input className={inputClass} inputMode="numeric" autoComplete="cc-exp" placeholder="08/29" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: fmtExpiry(e.target.value) })} />
          </Field>
          <Field label="Security code" error={tried && errors.cvc}>
            <input className={inputClass} type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} />
          </Field>
        </div>
      )}

      {method === 'upi' && (
        <Field label="UPI ID" error={tried && errors.upi}>
          <input className={inputClass} placeholder="name@bank" autoCapitalize="none" value={upi} onChange={(e) => setUpi(e.target.value)} />
        </Field>
      )}

      <p className="text-sm text-white/50">This is a demo checkout. No payment is processed and nothing is sent anywhere.</p>

      <div className="flex flex-wrap gap-3">
        <GhostButton type="button" onClick={() => setStep(3)}>Back</GhostButton>
        <PrimaryButton type="button" onClick={confirm} disabled={busy}>
          {busy ? 'Confirming…' : method === 'cash' ? 'Confirm booking' : `Pay ${quote ? inr(quote.total) : ''}`}
        </PrimaryButton>
      </div>
    </div>
  );
}

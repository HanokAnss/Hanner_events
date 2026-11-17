'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBooking } from '@/lib/bookingStore';
import { EVENT_TYPES, isEventType } from '@/lib/events';
import Logo from '@/components/home/Logo';
import Summary from './Summary';
import { EventStep, GuestStep, ServicesStep } from './Steps';
import DetailsStep, { detailsValid } from './DetailsStep';
import PaymentStep from './PaymentStep';
import Done from './Done';
import { GhostButton, PrimaryButton, cx } from './ui';

const STEPS = [
  { title: 'What kind of event?', label: 'Event' },
  { title: 'How many guests?', label: 'Guests' },
  { title: 'Which services do you need?', label: 'Services' },
  { title: 'Your details', label: 'Details' },
  { title: 'Payment', label: 'Payment' },
];

export default function Wizard() {
  const params = useSearchParams();
  const b = useBooking();
  const [tried, setTried] = useState(false);

  // /plan?type=church preselects the event and starts at the guest step.
  useEffect(() => {
    const t = params.get('type');
    if (t && isEventType(t) && useBooking.getState().step === 0) {
      useBooking.getState().setEventType(t);
      useBooking.getState().setStep(1);
    }
  }, [params]);

  const accent = EVENT_TYPES.find((e) => e.id === b.eventType)?.accent ?? '#ff9f5a';
  const { food } = b.services;
  const foodOk = !food.on || food.veg || food.nonVeg || food.dessert;
  const canNext = useMemo(
    () => [!!b.eventType, !!b.guestRange, foodOk, true][b.step] ?? false,
    [b.step, b.eventType, b.guestRange, foodOk],
  );

  const next = () => {
    if (b.step === 3) {
      setTried(true);
      if (!detailsValid(b.contact)) return;
    }
    b.setStep(b.step + 1);
  };

  return (
    <div className="min-h-screen px-5 pb-20 sm:px-8" style={{ '--accent': accent, background: 'linear-gradient(180deg,#1b1733 0%,#14121f 60%)' } as CSSProperties}>
      <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
        <Logo />
      </header>

      {b.step === 5 ? (
        <Done />
      ) : (
        <div className="mx-auto max-w-5xl">
          <ol className="mb-8 flex gap-2 text-sm" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.label} aria-current={i === b.step ? 'step' : undefined} className="flex-1">
                <span className="block h-1 rounded-full" style={{ background: i <= b.step ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }} />
                <span className={cx('mt-2 hidden sm:block', i === b.step ? 'text-white' : 'text-white/45')}>{s.label}</span>
              </li>
            ))}
          </ol>

          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <main>
              <h1 className="mb-6 font-display text-2xl sm:text-3xl">{STEPS[b.step].title}</h1>
              {b.step === 0 && <EventStep />}
              {b.step === 1 && <GuestStep />}
              {b.step === 2 && <ServicesStep />}
              {b.step === 3 && <DetailsStep tried={tried} />}
              {b.step === 4 && <PaymentStep />}

              {b.step < 4 && (
                <div className="mt-8 flex gap-3">
                  {b.step > 0 && <GhostButton type="button" onClick={() => b.setStep(b.step - 1)}>Back</GhostButton>}
                  <PrimaryButton type="button" onClick={next} disabled={!canNext}>
                    {b.step === 3 ? 'Continue to payment' : 'Continue'}
                  </PrimaryButton>
                </div>
              )}
            </main>
            <Summary />
          </div>
        </div>
      )}
    </div>
  );
}

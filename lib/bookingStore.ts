import { create } from 'zustand';
import { DEFAULT_SERVICES, type Contact, type EventTypeId, type GuestRangeId, type PaymentMethod, type Services } from './events';

interface BookingState {
  step: number;
  eventType: EventTypeId | null;
  guestRange: GuestRangeId | null;
  services: Services;
  contact: Contact;
  method: PaymentMethod;
  reference: string | null;
  setStep: (n: number) => void;
  setEventType: (t: EventTypeId) => void;
  setGuestRange: (g: GuestRangeId) => void;
  patchServices: (fn: (s: Services) => Services) => void;
  setContact: (c: Partial<Contact>) => void;
  setMethod: (m: PaymentMethod) => void;
  complete: () => void;
  reset: () => void;
}

const initial = {
  step: 0,
  eventType: null,
  guestRange: null,
  services: DEFAULT_SERVICES,
  contact: { name: '', phone: '', email: '', date: '' },
  method: 'card' as PaymentMethod,
  reference: null,
};

// Card and UPI details are never stored here; they live in PaymentStep's local state only.
export const useBooking = create<BookingState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setEventType: (eventType) => set({ eventType }),
  setGuestRange: (guestRange) => set({ guestRange }),
  patchServices: (fn) => set((s) => ({ services: fn(s.services) })),
  setContact: (c) => set((s) => ({ contact: { ...s.contact, ...c } })),
  setMethod: (method) => set({ method }),
  complete: () => set({ reference: 'FF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), step: 5 }),
  reset: () => set({ ...initial }),
}));

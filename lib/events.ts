export type EventTypeId = 'concert' | 'dj' | 'church' | 'community' | 'birthday' | 'wedding';

export interface EventType {
  id: EventTypeId;
  label: string;
  blurb: string;
  accent: string;
  baseFee: number; // INR: planning, site set-up and a day-of manager
  guardEvery: number; // one security / crowd marshal per N guests
}

export const EVENT_TYPES: EventType[] = [
  { id: 'concert', label: 'Live concert', blurb: 'Stage, sound and lights for a performing act.', accent: '#9d8cff', baseFee: 60000, guardEvery: 40 },
  { id: 'dj', label: 'DJ gathering', blurb: 'A booth, a dance floor and a loud, lit room.', accent: '#ff4fa3', baseFee: 30000, guardEvery: 50 },
  { id: 'church', label: 'Church gathering', blurb: 'Seating and clear speech sound for a service.', accent: '#f2c46d', baseFee: 15000, guardEvery: 100 },
  { id: 'community', label: 'Community gathering', blurb: 'Marquee, tables and food for neighbours and clubs.', accent: '#5fd1a5', baseFee: 20000, guardEvery: 100 },
  { id: 'birthday', label: 'Birthday party', blurb: 'A private party for family and friends.', accent: '#ff9f5a', baseFee: 12000, guardEvery: 100 },
  { id: 'wedding', label: 'Wedding reception', blurb: 'Dinner, music and a decorated hall.', accent: '#f78fb3', baseFee: 50000, guardEvery: 80 },
];

export const isEventType = (v: string): v is EventTypeId => EVENT_TYPES.some((e) => e.id === v);

export type GuestRangeId = '10-50' | '50-100' | '100-200' | '200-300' | '300-400' | '400-500';

export interface GuestRange {
  id: GuestRangeId;
  label: string;
  max: number; // we plan crew and quantities for the top of the range
}

export const GUEST_RANGES: GuestRange[] = [
  { id: '10-50', label: '10 to 50', max: 50 },
  { id: '50-100', label: '50 to 100', max: 100 },
  { id: '100-200', label: '100 to 200', max: 200 },
  { id: '200-300', label: '200 to 300', max: 300 },
  { id: '300-400', label: '300 to 400', max: 400 },
  { id: '400-500', label: '400 to 500', max: 500 },
];

export interface Services {
  food: { on: boolean; veg: boolean; nonVeg: boolean; dessert: boolean };
  dj: { on: boolean; tier: 'sound' | 'full' };
  decor: { on: boolean; tier: 'classic' | 'premium' };
}

export const DEFAULT_SERVICES: Services = {
  food: { on: false, veg: true, nonVeg: false, dessert: false },
  dj: { on: false, tier: 'sound' },
  decor: { on: false, tier: 'classic' },
};

export type PaymentMethod = 'card' | 'upi' | 'cash';

export interface Contact {
  name: string;
  phone: string;
  email: string;
  date: string;
}

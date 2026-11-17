import type { EventTypeId } from './events';

export interface Section {
  id: string;
  kind: 'hero' | 'event' | 'cta';
  title: string;
  blurb: string;
  points: string[];
  cta: string;
  accent: string;
  bg: string;
  eventType?: EventTypeId;
  nav: string;
}

export const SECTIONS: Section[] = [
  {
    id: 'hero', kind: 'hero', nav: 'Intro',
    title: 'Plan the night. We run it.',
    blurb: 'Choose the event, the headcount and the services you need. You see the crew and the price before you pay.',
    points: [], cta: 'Plan your event', accent: '#ff9f5a', bg: '#16132a',
  },
  {
    id: 'concert', kind: 'event', nav: 'Concerts', eventType: 'concert',
    title: 'Live concerts',
    blurb: 'A stage the crowd can see and sound they can feel, from a 50-person showcase to a 500-person night.',
    points: ['Stage deck, truss and LED backdrop', 'Line-array sound with a front-of-house engineer', 'Barriers, security and an artist green room'],
    cta: 'Plan a concert', accent: '#9d8cff', bg: '#17113a',
  },
  {
    id: 'party', kind: 'event', nav: 'Parties', eventType: 'dj',
    title: 'DJ nights and parties',
    blurb: 'Booth, speakers, lights and a dance floor, all set up before the first guest walks in.',
    points: ['DJ booth with turntables and monitors', 'Speaker stacks sized to your guest count', 'Disco ball, string lights and fog on the full package'],
    cta: 'Plan a DJ night', accent: '#ff4fa3', bg: '#3b0d33',
  },
  {
    id: 'church', kind: 'event', nav: 'Church', eventType: 'church',
    title: 'Church gatherings',
    blurb: 'Clear sound for the sermon and the choir, seating that fits the congregation, and a calm room.',
    points: ['Speech-first sound with lapel and choir mics', 'Seating, aisle layout and altar flowers', 'Candles, signage and a quiet, discreet crew'],
    cta: 'Plan a gathering', accent: '#f2c46d', bg: '#2d2519',
  },
  {
    id: 'community', kind: 'event', nav: 'Community', eventType: 'community',
    title: 'Community gatherings',
    blurb: 'Marquees, long tables and good food for neighbours, clubs and fundraisers.',
    points: ['Marquee and tables with a seat for everyone', 'Veg, non-veg and dessert counters', 'Bunting, signage and a crew to serve and clear'],
    cta: 'Plan a gathering', accent: '#5fd1a5', bg: '#0f2f2a',
  },
  {
    id: 'plan', kind: 'cta', nav: 'Plan',
    title: 'Ready when you are.',
    blurb: 'It takes about three minutes. Pay by card or UPI, or settle in cash on the day.',
    points: [], cta: 'Start planning', accent: '#ff9f5a', bg: '#16132a',
  },
];

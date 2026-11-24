import { SECTIONS } from './sections';

/**
 * The hero is a pinned "stage": the page is STAGE_VH tall, the 3D scene stays on screen for
 * STAGE_VH - 100 vh of scrolling, then scrolls away to reveal the rest of the site.
 * Scroll is mapped to t = 0 … STEPS (one unit per viewport scrolled):
 *   t 0 → 3   box turns through the 4 events at the SAME close zoom (concert, party, church, community)
 *   t 3 → 4   last quarter-turn while the camera starts pulling back
 *   t 4 → 5   zoom out to the full view
 *   t 5 → 6   hold on the hero line, then the stage scrolls up and the page continues
 */
export const STAGE_VH = 700;
export const STEPS = STAGE_VH / 100 - 1;

const PI = Math.PI;
const [hero] = SECTIONS;
const ev = SECTIONS.filter((s) => s.kind === 'event');
const CLOSE = 4.3; // camera distance while zoomed in

export interface Key { x: number; y: number; z: number; yaw: number; pitch: number; accent: string; bg: string }

const k = (z: number, yaw: number, s: { accent: string; bg: string }, x = 0.2, pitch = 0.12): Key => ({ x, y: 0, z, yaw, pitch, accent: s.accent, bg: s.bg });

/** One keyframe per integer t. */
export const KEYS: Key[] = [
  k(CLOSE, 0, ev[0]),
  k(CLOSE, -PI / 2, ev[1]),
  k(CLOSE, -PI, ev[2]),
  k(CLOSE, -1.5 * PI, ev[3]),
  k(6.8, -2 * PI, hero, 0.22, 0.14),
  k(9.4, -2 * PI - 0.55, hero, 0.24, 0.16),
  k(9.4, -2 * PI - 0.7, hero, 0.24, 0.16),
];
export const EVENT_COUNT = ev.length;
export const EVENTS = ev;

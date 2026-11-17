import { EVENT_TYPES, GUEST_RANGES, type EventTypeId, type GuestRangeId, type Services } from './events';

// All rates are INR and live here so you can change them in one place.
export const RATES = {
  vegPerPlate: 350,
  nonVegPerPlate: 550,
  dessertPerHead: 120,
  djSound: 25000, // DJ + 2 speaker stacks
  djFull: 45000, // + lights and fog
  extraStack: 6000,
  decorClassic: { flat: 15000, perHead: 60 },
  decorPremium: { flat: 40000, perHead: 140 },
  gst: 0.18,
};

export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const speakerStacks = (guests: number) => Math.max(2, Math.ceil(guests / 125));

export interface PriceLine { label: string; detail: string; amount: number }
export interface CrewRole { role: string; count: number }
export interface CrewGroup { operation: string; roles: CrewRole[]; total: number }
export interface Quote {
  guests: number;
  lines: PriceLine[];
  subtotal: number;
  gst: number;
  total: number;
  crew: CrewGroup[];
  crewTotal: number;
}

function group(operation: string, roles: CrewRole[]): CrewGroup {
  const kept = roles.filter((r) => r.count > 0);
  return { operation, roles: kept, total: kept.reduce((n, r) => n + r.count, 0) };
}

export function buildQuote(eventType: EventTypeId | null, guestRange: GuestRangeId | null, services: Services): Quote | null {
  const type = EVENT_TYPES.find((e) => e.id === eventType);
  const range = GUEST_RANGES.find((g) => g.id === guestRange);
  if (!type || !range) return null;

  const guests = range.max;
  const { food, dj, decor } = services;
  const lines: PriceLine[] = [
    { label: `${type.label}: setup and coordination`, detail: 'Planning, site set-up, day-of event manager', amount: type.baseFee },
  ];
  const crew: CrewGroup[] = [
    group('Coordination and safety', [
      { role: 'Event managers', count: Math.ceil(guests / 150) },
      { role: 'Security and crowd marshals', count: Math.max(2, Math.ceil(guests / type.guardEvery)) },
    ]),
  ];

  if (food.on) {
    const mains = [food.veg && 'veg', food.nonVeg && 'nonVeg'].filter(Boolean) as ('veg' | 'nonVeg')[];
    const plates = mains.length ? Math.ceil(guests / mains.length) : 0;
    const cooks: CrewRole[] = [];
    if (food.veg) {
      lines.push({ label: 'Vegetarian menu', detail: `${plates} plates × ${inr(RATES.vegPerPlate)}`, amount: plates * RATES.vegPerPlate });
      cooks.push({ role: 'Cooks (veg)', count: Math.ceil(plates / 60) });
    }
    if (food.nonVeg) {
      lines.push({ label: 'Non-vegetarian menu', detail: `${plates} plates × ${inr(RATES.nonVegPerPlate)}`, amount: plates * RATES.nonVegPerPlate });
      cooks.push({ role: 'Cooks (non-veg)', count: Math.ceil(plates / 60) });
    }
    if (food.dessert) {
      lines.push({ label: 'Dessert counter', detail: `${guests} guests × ${inr(RATES.dessertPerHead)}`, amount: guests * RATES.dessertPerHead });
      cooks.push({ role: 'Dessert chefs', count: Math.ceil(guests / 120) });
    }
    crew.push(group('Food and catering', [...cooks, { role: 'Servers', count: Math.ceil(guests / 30) }, { role: 'Food captain', count: guests > 100 ? 1 : 0 }]));
  }

  if (dj.on) {
    const stacks = speakerStacks(guests);
    const base = dj.tier === 'full' ? RATES.djFull : RATES.djSound;
    lines.push({
      label: dj.tier === 'full' ? 'DJ, speakers, lights and fog' : 'DJ and speakers',
      detail: `${stacks} speaker stacks`,
      amount: base + (stacks - 2) * RATES.extraStack,
    });
    crew.push(group('DJ and sound', [
      { role: 'DJ', count: 1 },
      { role: 'Sound engineers', count: stacks > 3 ? 2 : 1 },
      { role: 'Lighting operator', count: dj.tier === 'full' ? 1 : 0 },
      { role: 'Stage hands', count: Math.ceil(guests / 200) },
    ]));
  }

  if (decor.on) {
    const r = decor.tier === 'premium' ? RATES.decorPremium : RATES.decorClassic;
    lines.push({
      label: decor.tier === 'premium' ? 'Premium decorations' : 'Classic decorations',
      detail: `${inr(r.flat)} + ${inr(r.perHead)} × ${guests} guests`,
      amount: r.flat + r.perHead * guests,
    });
    crew.push(group('Decorations', [
      { role: 'Decorators', count: decor.tier === 'premium' ? Math.ceil(guests / 25) + 2 : Math.ceil(guests / 40) + 1 },
      { role: 'Lead designer', count: decor.tier === 'premium' ? 1 : 0 },
    ]));
  }

  const subtotal = lines.reduce((n, l) => n + l.amount, 0);
  const gst = Math.round(subtotal * RATES.gst);
  return { guests, lines, subtotal, gst, total: subtotal + gst, crew, crewTotal: crew.reduce((n, g) => n + g.total, 0) };
}

# ADR-001: Scroll-driven 3D landing + form-based planner

**Status:** Accepted

## Context
The brief: an event-management site with a Blender-style 3D box (four themed sides), scroll-driven rotation, cursor-reactive 3D, no 3D on small screens, and a customer planner
(event type, guest range up to 500, food/DJ/decor, crew per operation, card/UPI/cash).

## Decision
- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind. React Three Fiber for the scene, Zustand for shared state.
- **Layered separation** (web3d-integration-patterns, pattern 1): the DOM overlay (text, nav), the scroll layer (writes a single `progress` float) and the 3D layer (reads `progress` every frame) never import each other. They only share `lib/sceneStore.ts`.
- **Scrolling** is native and free (`hooks/useSmoothScroll.ts`): the page is one viewport per section, scroll position maps to a float `progress`, and a frame loop eases it so the box glides. No GSAP is needed for this.
- **Model:** a procedural R3F cube ships by default. `blender/build_event_cube.py` builds the same cube in Blender and exports `public/models/event-cube.glb`; if that file exists it replaces the procedural one automatically.
- **Responsive:** below 1024px the WebGL tree is not mounted at all (`useMediaQuery`), and a plain stacked layout with native scrolling is rendered.
- **Planner:** separate `/plan` route (normal scrolling, no 3D). Price and crew are pure functions in `lib/pricing.ts`, so the live summary, the services step and the review step cannot disagree.
- **Payments:** demo only. Card and UPI inputs stay in local component state, are validated (Luhn, expiry, UPI format) and are discarded on confirm.

## Options considered
| | Native scroll + eased progress (chosen) | Custom stepped controller |
|---|---|---|
| Feel | Smooth, every scroll counts | One gesture per section |
| Accessibility | Keyboard, scrollbar, find-in-page all work | Needs custom key support |
| Deep links | Possible later | Not possible |

## Consequences
- Easier: tuning the feel (duration, easing) in one place; swapping the model without touching code.
- Harder: text and box are fixed over a tall spacer, so section text must stay short enough to fit one viewport.
- Revisit: a real payment gateway and a server route to store bookings.

## Action items
1. [ ] Add a payment gateway (Razorpay/Stripe) behind an API route.
2. [ ] Persist bookings in a database and email the confirmation.
3. [ ] Export the Blender model and check file size (keep under ~3 MB).

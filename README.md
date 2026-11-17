# Fourfold Events

Event-management site: Next.js 14, TypeScript, Tailwind, React Three Fiber, GSAP, Zustand.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
```
Open the folder in VS Code and run the commands in its terminal.

## What is where
| Path | Purpose |
|---|---|
| `app/page.tsx` | Home. Desktop (≥1024px) gets the 3D box; smaller screens get a plain stacked page with **no WebGL** |
| `app/plan/page.tsx` | Planner: event → guests → services → details → payment |
| `hooks/useSmoothScroll.ts` | Native smooth scrolling: scroll position drives the box continuously |
| `components/three/` | The box, the four dioramas, cursor tilt |
| `lib/pricing.ts` | **All rates, crew ratios and GST** (INR). Edit here |
| `lib/events.ts` | Event types and guest ranges |
| `blender/build_event_cube.py` | Builds the same box in Blender and exports a GLB |

## Using a Blender model
```bash
blender --background --python blender/build_event_cube.py
```
This writes `public/models/event-cube.glb`. Restart `npm run dev`; the site uses it automatically
(delete the file to go back to the built-in model). The script is written for Blender 4.x.

## Notes
- Checkout is a demo: no money moves and card details are never stored or sent. Add a gateway before going live.
- Crew and quantities are planned for the **top** of the chosen guest range.

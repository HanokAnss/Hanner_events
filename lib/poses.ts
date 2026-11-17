/**
 * Where the 3D box goes for each section.
 *  x      horizontal position as a fraction of the visible width (negative = left, positive = right)
 *  y      vertical position as a fraction of the visible height
 *  z      camera distance (smaller = zoom in, larger = zoom out)
 *  yaw    spin around the vertical axis (radians)
 *  pitch  tilt towards / away from the viewer (radians)
 * The page text always sits on the opposite side of the box.
 */
export const BRAND_WORD = 'Hanner Events';

export interface Pose { x: number; y: number; z: number; yaw: number; pitch: number }

const PI = Math.PI;
/** Pitch that turns the box so its bottom face looks straight at the camera (camera sits ~9.7° above). */
export const FLIP_PITCH = -PI / 2 - 0.17;

export const POSES: Pose[] = [
  { x: 0.23, y: 0, z: 8.2, yaw: -0.6, pitch: 0.16 }, // hero: right, far
  { x: -0.23, y: 0, z: 6.2, yaw: 0, pitch: 0.14 }, // concerts: left
  { x: 0.23, y: -0.04, z: 5.2, yaw: -PI / 2, pitch: 0.14 }, // parties: right, close
  { x: -0.23, y: 0.04, z: 6.8, yaw: -PI, pitch: 0.14 }, // church: left, pulled back
  { x: 0.23, y: -0.04, z: 5.4, yaw: -1.5 * PI, pitch: 0.14 }, // community: right, close
  { x: -0.2, y: 0, z: 4.7, yaw: -2 * PI, pitch: FLIP_PITCH }, // plan: upside down, bottom face + brand word
];

/** Which side of the screen the text goes on for section i. */
export const textSide = (i: number): 'left' | 'right' => (POSES[i].x > 0 ? 'left' : 'right');


export type RGB = [number, number, number];
 
export const hexToRgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
 
export function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
 
const clampIndex = (len: number, p: number) => {
  const q = Math.min(Math.max(p, 0), len - 1);
  const i = Math.min(Math.floor(q), len - 2);
  return { i, t: q - i };
};
 
/** Interpolates a list of hex colours at a fractional index. */
export function sampleColors(list: string[], p: number) {
  const { i, t } = clampIndex(list.length, p);
  return mixHex(list[i], list[i + 1], t);
}
 
/** Same as sampleColors but returns numeric RGB (for canvas drawing). */
export function sampleRgb(list: string[], p: number): RGB {
  const { i, t } = clampIndex(list.length, p);
  const A = hexToRgb(list[i]);
  const B = hexToRgb(list[i + 1]);
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
}
 
/** Linear interpolation of a list of numbers at a fractional index. */
export function sampleNumbers(list: number[], p: number) {
  const { i, t } = clampIndex(list.length, p);
  return list[i] + (list[i + 1] - list[i]) * t;
}
 
/** Like sampleNumbers but eased (smoothstep) so each pose "dwells" and then glides to the next. */
export function sampleEased(list: number[], p: number) {
  const { i, t } = clampIndex(list.length, p);
  const e = t * t * (3 - 2 * t);
  return list[i] + (list[i + 1] - list[i]) * e;
}
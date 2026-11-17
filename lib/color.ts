const toRgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function mixHex(a: string, b: string, t: number) {
  const A = toRgb(a);
  const B = toRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Interpolates a list of hex colours at a fractional index. */
export function sampleColors(list: string[], p: number) {
  const q = Math.min(Math.max(p, 0), list.length - 1);
  const i = Math.min(Math.floor(q), list.length - 2);
  return mixHex(list[i], list[i + 1], q - i);
}

/** Interpolates a list of numbers at a fractional index. */
export function sampleNumbers(list: number[], p: number) {
  const q = Math.min(Math.max(p, 0), list.length - 1);
  const i = Math.min(Math.floor(q), list.length - 2);
  return list[i] + (list[i + 1] - list[i]) * (q - i);
}

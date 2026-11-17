export const validName = (v: string) => v.trim().length >= 2;
export const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
export const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const validUpi = (v: string) => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());

export function validDate(v: string) {
  if (!v) return false;
  const d = new Date(v + 'T00:00:00');
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d >= tomorrow;
}

export function luhn(num: string) {
  if (num.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validExpiry(v: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  return new Date(2000 + Number(m[2]), month, 1) > new Date(); // valid through the end of that month
}

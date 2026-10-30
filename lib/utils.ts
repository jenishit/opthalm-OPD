import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Formats a dioptre value with an explicit sign, e.g. -1.25, +0.50, 0.00. */
export const fD = (v: number | null | undefined) =>
  v == null ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2);

export const today0 = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const fmtDate = (d: Date, o: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  d.toLocaleDateString("en-GB", o);

/** Deterministic avatar background hue + initials from a display name, for mock/local patient records with no photo. */
export const avatarAccent = (name: string) => {
  const hue = (name.charCodeAt(0) * 7 + name.length * 31) % 360;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return { hue, initials };
};

/** Formats an amount in Nepali Rupees with Indian-style digit grouping, e.g. Rs. 1,25,000. */
export const formatCurrency = (amount: number) =>
  `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;

/** Sets a value at a path inside a (possibly nested) plain object/array, returning a new copy. */
export const setIn = (o: any, p: Array<string | number>, v: any): any => {
  if (!p.length) return v;
  const [k, ...r] = p;
  const c = Array.isArray(o) ? [...o] : { ...o };
  c[k as any] = setIn(o ? o[k as any] : undefined, r, v);
  return c;
};
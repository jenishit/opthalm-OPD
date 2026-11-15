import * as z from "zod";

// Number inputs are kept as strings in the form (so an empty box stays empty)
// and validated here; callers convert with Number() on submit.

const isNum = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));

/** Optional amount ≥ 0 ("" allowed). */
export const optionalMoney = (label: string) =>
  z.string().trim().refine((v) => v === "" || (isNum(v) && Number(v) >= 0), `${label} must be zero or more`);

/** Required amount ≥ 0. */
export const requiredMoney = (label: string) =>
  z.string().trim().min(1, `${label} is required`).refine((v) => isNum(v) && Number(v) >= 0, `${label} must be zero or more`);

/** Required amount > 0. */
export const positiveMoney = (label: string) =>
  z.string().trim().min(1, `${label} is required`).refine((v) => isNum(v) && Number(v) > 0, `${label} must be more than zero`);

/** Optional whole number ≥ 0. */
export const optionalInt = (label: string) =>
  z.string().trim().refine((v) => v === "" || (isNum(v) && Number.isInteger(Number(v)) && Number(v) >= 0), `${label} must be a whole number`);

/** Required whole number ≥ 1. */
export const positiveInt = (label: string) =>
  z.string().trim().min(1, `${label} is required`).refine((v) => isNum(v) && Number.isInteger(Number(v)) && Number(v) >= 1, `${label} must be a whole number above 0`);

/** Optional ISO date (yyyy-mm-dd) as produced by <input type="date">. */
export const optionalDate = z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date");

export const emailField = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address"));

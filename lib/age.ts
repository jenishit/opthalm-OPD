const DAY = 86_400_000;

/**
 * Human age from a date of birth: "12 years" normally, but "7 months" / "9 days"
 * for under a year, so an infant never reads as "0 years". Falls back to a
 * whole-year count when only an approximate age is known.
 */
export function formatAge(dob?: string | null, fallbackYears?: number | null, now: Date = new Date()): string {
  const birth = dob ? new Date(dob) : null;
  if (birth && !Number.isNaN(birth.getTime()) && birth.getTime() <= now.getTime()) {
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months -= 1;
    if (months >= 12) {
      const y = Math.floor(months / 12);
      return `${y} ${y === 1 ? "year" : "years"}`;
    }
    if (months >= 1) return `${months} ${months === 1 ? "month" : "months"}`;
    const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / DAY));
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  if (fallbackYears != null) return `${fallbackYears} ${fallbackYears === 1 ? "year" : "years"}`;
  return "Age unknown";
}

/** Compact form for tables and print headers: "12 yrs", "7 mo", "9 d". */
export function formatAgeShort(dob?: string | null, fallbackYears?: number | null, now?: Date): string {
  return formatAge(dob, fallbackYears, now)
    .replace(/^1 year$/, "1 yr")
    .replace(/ years$/, " yrs")
    .replace(/ months?$/, " mo")
    .replace(/ days?$/, " d");
}

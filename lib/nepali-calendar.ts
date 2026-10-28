/**
 * Bikram Sambat (BS) ↔ Gregorian (AD) calendar helpers, built on the
 * tabulated converter in @remotemerge/nepali-date-converter. Client-safe and
 * dependency-free on our side; every conversion is a pure lookup.
 *
 * BS dates are stored as plain integers ({ year, month, day }) — the app's
 * persisted value is always the ISO Gregorian date string (YYYY-MM-DD).
 */
import DateConverter from "@remotemerge/nepali-date-converter";

export type BSDate = { year: number; month: number; day: number };
export type CalendarMode = "BS" | "AD";

/** Baishakh (1) … Chaitra (12) */
export const BS_MONTHS_EN = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_MONTHS_NP = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फागुन",
  "चैत्र",
] as const;

const NP_DIGITS = "०१२३४५६७८९";

/** ० = Sunday … ६ = Saturday, Nepali full weekday names. */
export const BS_WEEKDAYS_NP = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
] as const;

/** 16345 → १६३४५ */
export function toNpDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => NP_DIGITS[Number(d)]);
}

const AD_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Conversions (null outside 1975-01-01 BS … 2099-12-30 BS) ────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO AD (YYYY-MM-DD) → BS parts, or null when outside the table range. */
export function adToBs(iso: string): BSDate | null {
  try {
    const r = new DateConverter(iso).toBs();
    return { year: r.year, month: r.month, day: r.date };
  } catch {
    return null;
  }
}

/** BS parts → ISO AD (YYYY-MM-DD), or null when out of range/invalid. */
export function bsToAd(bs: BSDate): string | null {
  try {
    const r = new DateConverter(`${pad(bs.year)}-${pad(bs.month)}-${pad(bs.day)}`).toAd();
    return `${pad(r.year)}-${pad(r.month)}-${pad(r.date)}`;
  } catch {
    return null;
  }
}

const monthLengthCache = new Map<string, number>();

/** Days in a BS month (29–32, varies per year) — probed from the table. */
export function bsDaysInMonth(year: number, month: number): number {
  const key = `${year}-${month}`;
  const cached = monthLengthCache.get(key);
  if (cached) return cached;
  let days = 0;
  for (let d = 28; d <= 32; d++) {
    try {
      new DateConverter(`${year}-${month}-${d}`).toAd();
      days = d;
    } catch {
      break;
    }
  }
  if (days) monthLengthCache.set(key, days);
  return days;
}

/** 0 = Sunday … 6 = Saturday for a date in either calendar. */
export function bsWeekdayIndex(bs: BSDate, iso?: string): number {
  try {
    const r = new DateConverter(iso ?? bsToAd(bs) ?? "").toAd();
    return AD_DAY_NAMES.indexOf(r.day) < 0 ? 0 : AD_DAY_NAMES.indexOf(r.day);
  } catch {
    return 0;
  }
}

/** Weekday names in both scripts for an ISO AD date (null when out of range). */
export function weekdayName(iso: string): { en: string; np: string } | null {
  try {
    const r = new DateConverter(iso).toAd();
    const i = AD_DAY_NAMES.indexOf(r.day);
    return i < 0 ? null : { en: AD_DAY_NAMES[i], np: BS_WEEKDAYS_NP[i] };
  } catch {
    return null;
  }
}

/** The calendar date today in Nepal time (Asia/Kathmandu), ISO AD. */
export function todayIsoKathmandu(): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${pad(Number(parts.month))}-${pad(Number(parts.day))}`;
}

// ── Formatting ──────────────────────────────────────────────────────────────

export function formatBs(bs: BSDate, script: "np" | "en" = "np"): string {
  const month = script === "np" ? BS_MONTHS_NP[bs.month - 1] : BS_MONTHS_EN[bs.month - 1];
  return script === "np"
    ? `${month} ${toNpDigits(bs.day)}, ${toNpDigits(bs.year)}`
    : `${month} ${String(bs.day).padStart(2, "0")}, ${bs.year}`;
}

/** March 14, 1992 */
export function formatAd(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

import { idbDelete, idbGet, idbPut } from "@/lib/offline/idb";
import { getClinic, getPaymentConfig } from "@/services/clinic-services";

/** Seller (clinic) identity printed on every tax invoice and clinic letterhead. */
export interface SellerInfo {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNo?: string;
  pan?: string;
  vatNo?: string;
  taxLabel?: string;
  footer?: string;
  /** Logo ready to print: an inlined image (so it never expires and works offline) or, failing that, the clinic's link. */
  logo?: string;
}

const KEY = "seller:info";
/** The clinic's details change rarely, so they are re-read from the server at most once a day. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

interface Cached {
  key: string;
  value: SellerInfo;
  savedAt: number;
  /** Logo path (no signature/query) the inlined image was made from, to skip re-downloading an unchanged file. */
  logoPath?: string;
}

const readCache = () => idbGet<Cached>("kv", KEY).catch(() => undefined);

/** Forget the cached copy — call after the clinic profile, payment settings or logo change. */
export async function invalidateSellerCache(): Promise<void> {
  await idbDelete("kv", KEY).catch(() => {});
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** The logo's identity independent of its (short-lived) signature. */
function pathOf(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

/**
 * Downloads the logo once and returns it as a data URL. Uploaded logos live under
 * /uploads on the backend, which the app proxies, so the request stays same-origin
 * (the CSP only allows that). Anything else just falls back to the link itself.
 */
async function inlineLogo(url: string): Promise<string | undefined> {
  try {
    const u = new URL(url, window.location.origin);
    const sameSite = u.pathname.startsWith("/uploads/") ? `${u.pathname}${u.search}` : u.origin === window.location.origin ? `${u.pathname}${u.search}` : null;
    if (!sameSite) return undefined;
    const res = await fetch(sameSite, { credentials: "omit" });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/") || blob.size > MAX_LOGO_BYTES) return undefined;
    return await blobToDataUrl(blob);
  } catch {
    return undefined;
  }
}

/**
 * The clinic and payment-config endpoints are admin-only on the backend, so a
 * billing user can't fetch the PAN/VAT. Whenever an admin session can read
 * them they are saved on this device (they're business details, not patient
 * data), and every other session prints from that copy. The copy is trusted for
 * a day; a failed refresh falls back to it however old it is.
 */
export async function loadSellerInfo(opts: { force?: boolean } = {}): Promise<{ info: SellerInfo | null; fromCache: boolean }> {
  const cached = await readCache();
  if (cached && !opts.force && Date.now() - cached.savedAt < MAX_AGE_MS) return { info: cached.value, fromCache: true };

  try {
    const [clinic, pay] = await Promise.all([getClinic(), getPaymentConfig().catch(() => null)]);

    let logo: string | undefined;
    let logoPath: string | undefined;
    if (clinic.logo_url) {
      logoPath = pathOf(clinic.logo_url);
      // Same file as last time: keep the inlined copy instead of downloading it again.
      logo = cached?.logoPath === logoPath && cached.value.logo?.startsWith("data:") ? cached.value.logo : ((await inlineLogo(clinic.logo_url)) ?? clinic.logo_url);
    }

    const info: SellerInfo = {
      name: clinic.clinic_name,
      tagline: clinic.tagline,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      registrationNo: clinic.registration_no,
      pan: pay?.pan_number,
      vatNo: pay?.vat_registration_no,
      taxLabel: pay?.tax_label,
      footer: clinic.report_footer,
      logo,
    };
    await idbPut("kv", { key: KEY, value: info, savedAt: Date.now(), logoPath } satisfies Cached).catch(() => {});
    return { info, fromCache: false };
  } catch {
    return { info: cached?.value ?? null, fromCache: Boolean(cached) };
  }
}

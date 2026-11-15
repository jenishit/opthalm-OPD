import { idbGet, idbPut } from "@/lib/offline/idb";
import { getClinic, getPaymentConfig } from "@/services/clinic-services";

/** Seller (clinic) identity printed on every tax invoice. */
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
}

const KEY = "seller:info";

/**
 * The clinic and payment-config endpoints are admin-only on the backend, so a
 * billing user can't fetch the PAN/VAT. Whenever an admin session can read
 * them they are saved on this device (they're business details, not patient
 * data), and every other session prints from that copy.
 */
export async function loadSellerInfo(): Promise<{ info: SellerInfo | null; fromCache: boolean }> {
  try {
    const [clinic, pay] = await Promise.all([getClinic(), getPaymentConfig().catch(() => null)]);
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
    };
    await idbPut("kv", { key: KEY, value: info }).catch(() => {});
    return { info, fromCache: false };
  } catch {
    const row = await idbGet<{ key: string; value: SellerInfo }>("kv", KEY).catch(() => undefined);
    return { info: row?.value ?? null, fromCache: Boolean(row) };
  }
}

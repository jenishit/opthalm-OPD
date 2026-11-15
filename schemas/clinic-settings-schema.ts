import * as z from "zod";
import { optionalInt } from "./field-helpers";

const phone = z.string().trim().refine((v) => v === "" || /^[0-9+\-\s()]{7,20}$/.test(v), "Enter a valid phone number");
const optionalEmail = z.string().trim().refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address");

export const practiceProfileSchema = z.object({
  clinic_name: z.string().trim().min(1, "Practice name is required"),
  registration_no: z.string().trim(),
  tagline: z.string().trim(),
  address: z.string().trim(),
  phone,
  email: optionalEmail,
  report_footer: z.string(),
  workspace_slug: z.string().trim().regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only"),
  default_currency: z.string(),
  timezone: z.string(),
  require_consent_before_exam: z.boolean(),
  low_stock_notifications: z.boolean(),
  logo_url: z
    .string()
    .trim()
    .max(500, "That link is too long")
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v) || /^\/(?!\/)\S*$/.test(v), "Use an https:// link, or a path like /uploads/logo.png"),
});
export type PracticeProfileForm = z.infer<typeof practiceProfileSchema>;

/** Nepal PAN / VAT registration numbers are 9 digits. */
const nineDigits = (label: string) => z.string().trim().refine((v) => v === "" || /^\d{9}$/.test(v), `${label} must be 9 digits`);

export const paymentConfigSchema = z
  .object({
    cash_enabled: z.boolean(),
    card_enabled: z.boolean(),
    bank_transfer_enabled: z.boolean(),
    qr_wallet_enabled: z.boolean(),
    tax_label: z.string().trim(),
    // "13" and "13%" are both accepted; stored exactly as typed.
    tax_rate: z.string().trim().refine((v) => {
      if (v === "") return true;
      const n = Number(v.replace(/%$/, ""));
      return Number.isFinite(n) && n >= 0 && n <= 100;
    }, "Tax rate must be a number from 0 to 100"),
    vat_registration_no: nineDigits("VAT registration number"),
    pan_number: nineDigits("PAN"),
    bank_name: z.string().trim(),
    bank_account_holder: z.string().trim(),
    bank_account_number: z.string().trim().refine((v) => v === "" || /^[0-9\-\s]{6,30}$/.test(v), "Enter a valid account number"),
    bank_branch: z.string().trim(),
    bank_swift_code: z.string().trim().refine((v) => v === "" || /^[A-Za-z0-9]{8,11}$/.test(v), "SWIFT codes are 8 or 11 characters"),
    qr_wallet_provider: z.string(),
    qr_wallet_merchant_id: z.string().trim(),
    qr_code_url: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.bank_transfer_enabled) {
      if (!v.bank_name) ctx.addIssue({ code: "custom", path: ["bank_name"], message: "Bank name is required for bank transfers" });
      if (!v.bank_account_number) ctx.addIssue({ code: "custom", path: ["bank_account_number"], message: "Account number is required for bank transfers" });
    }
  });
export type PaymentConfigForm = z.infer<typeof paymentConfigSchema>;

export const locationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required"),
  address: z.string().trim(),
  exam_rooms: optionalInt("Exam rooms"),
  status: z.enum(["active", "opening_soon"]),
});
export type LocationForm = z.infer<typeof locationSchema>;

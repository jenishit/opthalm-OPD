import type { RxFormValues } from "@/schemas/rx-form-schema";
import type { PrescriptionRecord, RxEye } from "../../_components/types";

export const VALID_MONTHS = [6, 12, 24];

export function newRecord(id: string, signedBy: string): PrescriptionRecord {
  return {
    id,
    prescriptionNumber: `RX-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    patientId: "",
    patientName: "",
    issuedAt: new Date().toISOString().slice(0, 10),
    lensType: "single_vision",
    pd: null,
    validMonths: 12,
    notes: "",
    od: { sph: null, cyl: null, axis: null, add: null },
    os: { sph: null, cyl: null, axis: null, add: null },
    signedBy,
    status: "draft",
  };
}

export function fmtSigned(v: number | null) {
  if (v == null) return "";
  return (v > 0 ? "+" : "") + v.toFixed(2);
}

export const fmtLongDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const fieldClass =
  "w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

// ── form ⇄ record mapping (the form keeps numbers as strings) ────────────────

const s = (n: number | null) => (n == null ? "" : String(n));
const n = (v: string) => (v.trim() === "" ? null : Number(v));

const eyeToForm = (e: RxEye) => ({ sph: s(e.sph), cyl: s(e.cyl), axis: s(e.axis), add: s(e.add) });
const eyeToRecord = (e: RxFormValues["od"]): RxEye => ({ sph: n(e.sph), cyl: n(e.cyl), axis: n(e.axis), add: n(e.add) });

export function toFormValues(r: PrescriptionRecord): RxFormValues {
  return {
    patientId: r.patientId,
    patientName: r.patientName,
    issuedAt: r.issuedAt,
    lensType: r.lensType,
    pd: s(r.pd),
    validMonths: String(r.validMonths) as RxFormValues["validMonths"],
    notes: r.notes,
    od: eyeToForm(r.od),
    os: eyeToForm(r.os),
  };
}

/** Merge edited form values over the immutable parts of the record (id, number, signer, status). */
export function toRecord(v: RxFormValues, base: PrescriptionRecord): PrescriptionRecord {
  return {
    ...base,
    patientId: v.patientId,
    patientName: v.patientName,
    issuedAt: v.issuedAt,
    lensType: v.lensType,
    pd: n(v.pd),
    validMonths: Number(v.validMonths),
    notes: v.notes,
    od: eyeToRecord(v.od),
    os: eyeToRecord(v.os),
  };
}

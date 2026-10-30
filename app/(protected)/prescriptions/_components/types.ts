export type LensType = "single_vision" | "bifocal" | "progressive" | "contact_lens" | "none";

export const LENS_TYPE_LABEL: Record<LensType, string> = {
  single_vision: "Single vision",
  bifocal: "Bifocal",
  progressive: "Progressive",
  contact_lens: "Contact lens",
  none: "None",
};

export interface RxEye {
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  add: number | null;
}

export type RxStatus = "draft" | "issued";

/**
 * Local record for this page. The real Prescription schema (services/prescriptions-services)
 * only carries metadata (id, visit, patient, type, signed/issued/printed dates) — the actual
 * refraction values live on visit readings, which have no list-by-prescription endpoint yet.
 * Kept self-contained here, same pattern as the new-patient and examinations workspaces.
 */
export interface PrescriptionRecord {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  issuedAt: string;
  lensType: LensType;
  pd: number | null;
  validMonths: number;
  notes: string;
  od: RxEye;
  os: RxEye;
  signedBy: string;
  status: RxStatus;
}

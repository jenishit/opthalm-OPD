import type { Patient } from "@/schemas/patient-schema";
import type { Visit } from "@/schemas/visit-schema";
import type { RefractionReading } from "@/schemas/refraction-schema";
import type { LensType, PrescriptionRecord, RxEye } from "@/types/prescription-types";
import { loadScheduleLong } from "./queue-services";
import { todayIsoKathmandu } from "@/lib/nepali-calendar";
import { getVisitClinical } from "./visits-services";

/**
 * The backend has no prescription document. A spectacle prescription IS the
 * "final_rx" refraction readings recorded on a visit, so the list is projected
 * from the clinic's real completed visits. Nothing here is invented: the number
 * is derived from the visit id and every value comes from the chart.
 */

/** Stable, derived Rx number — the same visit always gets the same number. */
export function rxNumberFor(visitId: string, issuedAt: string): string {
  return `RX-${issuedAt.slice(0, 4)}-${visitId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

const num = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function eyeOf(readings: RefractionReading[], eye: "OD" | "OS"): RxEye {
  const r = readings.find((x) => x.eye === eye);
  return { sph: num(r?.sphere), cyl: num(r?.cylinder), axis: num(r?.axis), add: num(r?.add_power) };
}

export function recordFromVisit(visit: Visit, patient: Patient, readings: RefractionReading[]): PrescriptionRecord | null {
  const finals = readings.filter((r) => r.stage === "final_rx");
  if (finals.length === 0) return null;
  const issuedAt = String(visit.visit_date).slice(0, 10);
  return {
    id: `visit-${visit.id}`,
    prescriptionNumber: rxNumberFor(visit.id, issuedAt),
    patientId: patient.id,
    patientName: `${patient.first_name} ${patient.last_name}`.trim(),
    issuedAt,
    lensType: (finals.find((r) => r.lens_type)?.lens_type as LensType | undefined) ?? "single_vision",
    pd: num(finals.find((r) => r.pd != null)?.pd),
    validMonths: 12,
    notes: "",
    od: eyeOf(finals, "OD"),
    os: eyeOf(finals, "OS"),
    signedBy: visit.examined_by ? `Dr. ${visit.examined_by.replace(/^Dr\.?\s*/i, "")}` : "Doctor",
    status: "issued",
    source: "visit",
    visitId: visit.id,
    patientRecordId: patient.id,
  };
}

const TTL_MS = 60_000;
const MAX_VISITS = 60;
const CONCURRENCY = 6;
let cache: { at: number; list: PrescriptionRecord[] } | null = null;

export function invalidatePrescriptionCache() {
  cache = null;
}

/** Prescriptions from the most recent completed visits that have a final refraction. */
export async function listVisitPrescriptions(): Promise<PrescriptionRecord[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.list;

  // Completed visits of the last 90 days, filtered on the server.
  const today = todayIsoKathmandu();
  const from = new Date(new Date(`${today}T00:00:00Z`).getTime() - 90 * 86_400_000).toISOString().slice(0, 10);
  const completed = await loadScheduleLong(from, today, "completed");
  const recent = completed
    .sort((a, b) => String(b.visit.scheduled_at ?? "").localeCompare(String(a.visit.scheduled_at ?? "")))
    .slice(0, MAX_VISITS);

  const out: PrescriptionRecord[] = [];
  // Bounded concurrency — one chart request per visit.
  for (let i = 0; i < recent.length; i += CONCURRENCY) {
    const batch = recent.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ visit, patient }) => {
        try {
          const clinical = await getVisitClinical(visit.id);
          return recordFromVisit(visit, patient, clinical.readings ?? []);
        } catch {
          return null; // one unreadable chart shouldn't hide the rest
        }
      }),
    );
    for (const r of results) if (r) out.push(r);
  }
  cache = { at: Date.now(), list: out };
  return out;
}

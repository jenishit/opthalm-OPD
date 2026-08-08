import { delay } from "@/lib/mock/delay";
import { mockPrescriptions } from "@/lib/mock/data";
import type { Prescription } from "@/lib/schemas/prescription.schema";

let prescriptions = [...mockPrescriptions];

export async function getPrescriptionsForVisit(visitId: string): Promise<Prescription[]> {
  await delay();
  return prescriptions.filter((p) => p.visit_id === visitId);
}

export async function getPrescriptionsForPatient(patientId: string): Promise<Prescription[]> {
  await delay();
  return prescriptions.filter((p) => p.patient_id === patientId).sort((a, b) => {
    const dateA = new Date(a.issued_at).getTime();
    const dateB = new Date(b.issued_at).getTime();
    return dateB - dateA;
  });
}

export async function createPrescription(
  visitId: string,
  patientId: string,
  type: Prescription["type"],
  signedBy: string
): Promise<Prescription> {
  await delay();
  
  // Generate a random prescription number (e.g., RX-2026-XXXX)
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const prescription_number = `RX-${year}-${randomSuffix}`;
  
  const newRx: Prescription = {
    id: `rx${Date.now()}`,
    visit_id: visitId,
    patient_id: patientId,
    prescription_number,
    type,
    signed_by: signedBy,
    issued_at: new Date().toISOString(),
    printed_at: new Date().toISOString(), // Assuming printed immediately on creation for simplicity
    created_at: new Date().toISOString(),
  };
  
  prescriptions = [newRx, ...prescriptions];
  return newRx;
}

export async function markPrescriptionPrinted(id: string): Promise<Prescription> {
  await delay();
  const idx = prescriptions.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Prescription not found");
  
  prescriptions[idx].printed_at = new Date().toISOString();
  return prescriptions[idx];
}

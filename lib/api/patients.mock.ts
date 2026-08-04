import { delay } from "@/lib/mock/delay";
import { mockPatients } from "@/lib/mock/data";
import type { Patient, PatientFormData } from "@/lib/schemas/patient.schema";

let patients = [...mockPatients];

export async function getPatients(search?: string): Promise<Patient[]> {
  await delay();
  if (!search) return patients;
  const q = search.toLowerCase();
  return patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.phone.includes(q)
  );
}

export async function getPatient(id: string): Promise<Patient | null> {
  await delay();
  return patients.find((p) => p.id === id) ?? null;
}

export async function getPatientByPhone(phone: string): Promise<Patient | null> {
  await delay();
  return patients.find((p) => p.phone === phone) ?? null;
}

export async function createPatient(data: PatientFormData): Promise<Patient> {
  await delay();
  const existing = patients.find((p) => p.phone === data.phone);
  if (existing) throw new Error("A patient with this phone number already exists");

  const newPatient: Patient = {
    ...data,
    id: `p${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  patients = [newPatient, ...patients];
  return newPatient;
}

export async function updatePatient(
  id: string,
  data: Partial<PatientFormData>
): Promise<Patient> {
  await delay();
  const idx = patients.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Patient not found");

  patients[idx] = {
    ...patients[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return patients[idx];
}

export async function checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
  await delay(100);
  return !patients.some((p) => p.phone === phone && p.id !== excludeId);
}

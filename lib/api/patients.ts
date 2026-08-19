import type { Patient, PatientFormData } from "@/lib/schemas/patient.schema";
import { ApiError } from "@/services/http";
import {
  createPatientDto,
  getPatientDto,
  listPatientDtos,
  searchPatientDtos,
  toCreateRequest,
  toUiPatient,
  toUpdateRequest,
  updatePatientDto,
} from "@/services/patients";

export async function getPatients(search?: string): Promise<Patient[]> {
  const dtos = search ? await searchPatientDtos(search) : await listPatientDtos();
  return dtos.map(toUiPatient);
}

export async function getPatient(id: string): Promise<Patient | null> {
  try {
    return toUiPatient(await getPatientDto(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getPatientByPhone(phone: string): Promise<Patient | null> {
  const matches = await searchPatientDtos(phone, 5);
  const exact = matches.find((p) => p.phone === phone);
  return exact ? toUiPatient(exact) : null;
}

export async function createPatient(data: PatientFormData): Promise<Patient> {
  return toUiPatient(await createPatientDto(toCreateRequest(data)));
}

export async function updatePatient(
  id: string,
  data: Partial<PatientFormData>
): Promise<Patient> {
  return toUiPatient(await updatePatientDto(id, toUpdateRequest(data)));
}

export async function checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
  const matches = await searchPatientDtos(phone, 5);
  return !matches.some((p) => p.phone === phone && p.patient_id !== excludeId);
}

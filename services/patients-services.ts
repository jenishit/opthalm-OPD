import { apiFetch, ApiError } from "./http";
import type { Patient, PatientFormData } from "@/schemas/patient-schema";
import type { CreatePatientRequest, PatientDTO, UpdatePatientRequest } from "@/types/api-types";

const SEX_OPTIONS = ["Male", "Female", "Other"] as const;

function splitName(fullName: string) {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(" ") };
}

function ageFromDob(dob: string): number | undefined {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function dobFromAge(age: number): string {
  return `${new Date().getFullYear() - age}-01-01`;
}

export function toUiPatient(dto: PatientDTO): Patient {
  const sex =
    SEX_OPTIONS.find((s) => s.toLowerCase() === dto.gender.toLowerCase()) ?? "Other";
  return {
    id: dto.patient_id,
    ...splitName(dto.full_name),
    phone: dto.phone,
    date_of_birth: dto.dob,
    age: ageFromDob(dto.dob),
    sex,
    occupation: dto.occupation ?? undefined,
    address_street: dto.address ?? undefined,
    created_at: dto.created_at,
  };
}

export function toCreateRequest(form: PatientFormData): CreatePatientRequest {
  const dob = form.date_of_birth || (form.age != null ? dobFromAge(form.age) : "");
  const address = [form.address_street, form.address_city, form.address_state, form.address_pin]
    .filter(Boolean)
    .join(", ");
  return {
    full_name: `${form.first_name} ${form.last_name}`.trim(),
    dob,
    // The patients table's check constraint expects lowercase ("male"…).
    gender: form.sex.toLowerCase(),
    phone: form.phone,
    occupation: form.occupation || undefined,
    address: address || undefined,
  };
}

// Builds a partial update; services.updatePatientDto merges it over the
// stored patient before PATCHing (the endpoint requires the full body).
export function toUpdateRequest(form: Partial<PatientFormData>): Partial<CreatePatientRequest> {
  const body: Partial<CreatePatientRequest> = {};
  if (form.first_name !== undefined || form.last_name !== undefined) {
    body.full_name = `${form.first_name ?? ""} ${form.last_name ?? ""}`.trim();
  }
  if (form.date_of_birth !== undefined) body.dob = form.date_of_birth;
  // The patients table's check constraint expects lowercase ("male"…).
  if (form.sex !== undefined) body.gender = form.sex.toLowerCase();
  if (form.phone !== undefined) body.phone = form.phone;
  if (form.occupation !== undefined) body.occupation = form.occupation;
  if (form.address_street !== undefined) {
    // Preserve other address parts the caller already knows about by leaving
    // them to the merge in updatePatientDto.
    body.address = form.address_street;
  }
  return body;
}

export function listPatientDtos(): Promise<PatientDTO[]> {
  return apiFetch<PatientDTO[]>("/patient");
}

export function searchPatientDtos(query: string, limit = 50): Promise<PatientDTO[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<PatientDTO[]>(`/patient/search?${params.toString()}`);
}

export function getPatientDto(id: string): Promise<PatientDTO> {
  return apiFetch<PatientDTO>(`/patient/${id}`);
}

export function createPatientDto(body: CreatePatientRequest): Promise<PatientDTO> {
  return apiFetch<PatientDTO>("/patient", { method: "POST", body: JSON.stringify(body) });
}

/**
 * PATCH /patient/:id reuses the create body (full_name, dob and phone are
 * required). Merge a partial update over the stored patient first.
 */
export async function updatePatientDto(
  id: string,
  partial: Partial<CreatePatientRequest>
): Promise<void> {
  const current = await getPatientDto(id);
  const body: UpdatePatientRequest = {
    full_name: partial.full_name ?? current.full_name,
    dob: partial.dob ?? current.dob,
    gender: partial.gender ?? current.gender ?? undefined,
    phone: partial.phone ?? current.phone,
    occupation: partial.occupation ?? current.occupation ?? undefined,
    email: partial.email ?? current.email ?? undefined,
    address: partial.address ?? current.address ?? undefined,
  };
  await apiFetch<void>(`/patient/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

/** PATCH /patient/:id/delete — soft delete, returns a message. */
export function deletePatientDto(id: string): Promise<void> {
  return apiFetch<void>(`/patient/${id}/delete`, { method: "PATCH" });
}

// ── UI-facing patient API ────────────────────────────────────────────────────

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
  // The endpoint requires the full body; merge this partial over the stored
  // patient before PATCHing, then refetch.
  await updatePatientDto(id, toUpdateRequest(data));
  return toUiPatient(await getPatientDto(id));
}

export async function checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
  const matches = await searchPatientDtos(phone, 5);
  return !matches.some((p) => p.phone === phone && p.patient_id !== excludeId);
}

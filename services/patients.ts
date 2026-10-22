import { apiFetch } from "./http";
import type { Patient, PatientFormData } from "@/lib/schemas/patient.schema";
import type { CreatePatientRequest, PatientDTO, UpdatePatientRequest } from "@/types/api";

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
    gender: form.sex,
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
  if (form.sex !== undefined) body.gender = form.sex;
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

export function updatePatientDto(id: string, body: UpdatePatientRequest): Promise<PatientDTO> {
  return apiFetch<PatientDTO>(`/patient/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

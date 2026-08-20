// Mirrors the Go backend DTOs in internal/adapter/handler/http/dto.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  messages: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  session_id: string;
  user_id: string;
  user_role: string;
}

export interface ProfileResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_name: string;
  email: string;
}

export interface PatientDTO {
  patient_id: string;
  full_name: string;
  dob: string;
  gender: string;
  phone: string;
  occupation: string | null;
  registered_on: string;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface CreatePatientRequest {
  full_name: string;
  dob: string;
  gender?: string;
  phone: string;
  occupation?: string;
  email?: string;
  address?: string;
}

export type UpdatePatientRequest = Partial<CreatePatientRequest>;

export type VisitStatusDTO = "scheduled" | "waiting" | "examining" | "completed" | "cancelled";

export interface EntityRefDTO {
  id: string;
  name: string;
}

export interface PatientRefDTO {
  id: string;
  name: string;
}

export interface VisitItemDTO {
  id: string;
  examine_by: EntityRefDTO;
  status: VisitStatusDTO;
  visit_date: string;
  chief_complaint: string;
  created_by: EntityRefDTO;
  updated_by: EntityRefDTO;
  created_at: string;
  updated_at: string;
}

export interface VisitDTO extends VisitItemDTO {
  patient: PatientRefDTO;
}

export interface PatientVisitsDTO {
  patient: PatientRefDTO;
  visits: VisitItemDTO[];
}

// PATCH /visit/:id reuses the create body, so every field is required.
export interface VisitUpsertRequest {
  patient_id: string;
  examine_by: string;
  status: VisitStatusDTO;
  visit_date: string;
  chief_complaint: string;
}

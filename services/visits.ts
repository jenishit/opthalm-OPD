import { apiFetch } from "./http";
import type { Visit, VisitStatus } from "@/lib/schemas/visit.schema";
import type { PatientVisitsDTO, VisitDTO, VisitItemDTO, VisitUpsertRequest } from "@/types/api";

export function toUiVisit(dto: VisitItemDTO, patientId: string): Visit {
  return {
    id: dto.id,
    patient_id: patientId,
    examined_by: dto.examine_by.name,
    status: dto.status as VisitStatus,
    visit_date: dto.visit_date,
    chief_complaint: dto.chief_complaint,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function getPatientVisitDtos(patientId: string): Promise<PatientVisitsDTO> {
  return apiFetch<PatientVisitsDTO>(`/visit/patient/${patientId}`);
}

export function getVisitDto(id: string): Promise<VisitDTO> {
  return apiFetch<VisitDTO>(`/visit/${id}`);
}

export function updateVisitDto(id: string, body: VisitUpsertRequest): Promise<unknown> {
  return apiFetch<unknown>(`/visit/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

import { apiFetch } from "./http";
import type {
  CreateLabJobRequest,
  LabJobDTO,
  UpdateLabJobStatusRequest,
} from "@/types/api-types";

/** POST /lab-jobs */
export function createLabJob(body: CreateLabJobRequest): Promise<LabJobDTO> {
  return apiFetch<LabJobDTO>("/lab-jobs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /lab-jobs?limit&offset */
export function listLabJobs(limit = 100, offset = 0): Promise<LabJobDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<LabJobDTO[]>(`/lab-jobs?${params.toString()}`);
}

/** GET /lab-jobs/:id */
export function getLabJob(id: string): Promise<LabJobDTO> {
  return apiFetch<LabJobDTO>(`/lab-jobs/${id}`);
}

/** PATCH /lab-jobs/:id/status */
export function updateLabJobStatus(
  id: string,
  body: UpdateLabJobStatusRequest
): Promise<void> {
  return apiFetch<void>(`/lab-jobs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** GET /lab-jobs/patient/:patientId */
export function listPatientLabJobs(patientId: string): Promise<LabJobDTO[]> {
  return apiFetch<LabJobDTO[]>(`/lab-jobs/patient/${patientId}`);
}

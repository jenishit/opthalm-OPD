import { apiFetch } from "./http";
import type {
  CreateLabJobRequest,
  LabJob,
  UpdateLabJobStatusRequest,
} from "@/types/lab-types";

/** POST /lab-jobs */
export function createLabJob(body: CreateLabJobRequest): Promise<LabJob> {
  return apiFetch<LabJob>("/lab-jobs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /lab-jobs?limit&offset */
export function listLabJobs(limit = 100, offset = 0): Promise<LabJob[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<LabJob[]>(`/lab-jobs?${params.toString()}`);
}

/** GET /lab-jobs/:id */
export function getLabJob(id: string): Promise<LabJob> {
  return apiFetch<LabJob>(`/lab-jobs/${id}`);
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
export function listPatientLabJobs(patientId: string): Promise<LabJob[]> {
  return apiFetch<LabJob[]>(`/lab-jobs/patient/${patientId}`);
}

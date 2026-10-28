import { apiFetch } from "./http";
import type { ClinicRequest, ClinicResponse } from "@/types/api-types";

/** GET /admin/clinic — the admin's own clinic settings. */
export function getClinic(): Promise<ClinicResponse> {
  return apiFetch<ClinicResponse>("/admin/clinic");
}

/** POST /admin/clinic */
export function createClinic(body: ClinicRequest): Promise<ClinicResponse> {
  return apiFetch<ClinicResponse>("/admin/clinic", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /admin/clinic/:id */
export function getClinicById(id: string): Promise<ClinicResponse> {
  return apiFetch<ClinicResponse>(`/admin/clinic/${id}`);
}

/** PATCH /admin/clinic/:id */
export function updateClinic(id: string, body: ClinicRequest): Promise<void> {
  return apiFetch<void>(`/admin/clinic/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

import { apiFetch } from "./http";
import type {
  PlatformClinicDetail,
  PlatformOverview,
  PlatformUsers,
} from "@/types/platform-types";

/** GET /platform/analytics/overview — platform-operator (superadmin) only. */
export function getPlatformOverview(from: string, to: string): Promise<PlatformOverview> {
  const params = new URLSearchParams({ from, to });
  return apiFetch<PlatformOverview>(`/platform/analytics/overview?${params.toString()}`);
}

/** GET /platform/analytics/clinics/:clinicId — one tenant's usage and revenue. */
export function getPlatformClinic(
  clinicId: string,
  from: string,
  to: string,
): Promise<PlatformClinicDetail> {
  const params = new URLSearchParams({ from, to });
  return apiFetch<PlatformClinicDetail>(
    `/platform/analytics/clinics/${clinicId}?${params.toString()}`,
  );
}

/** GET /platform/analytics/users — every account across every tenant. */
export function getPlatformUsers(): Promise<PlatformUsers> {
  return apiFetch<PlatformUsers>("/platform/analytics/users");
}

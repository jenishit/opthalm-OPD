import { apiFetch } from "./http";
import type {
  ClinicAuditLogEntry,
  ClinicIntegration,
  ClinicIntegrationProvider,
  ClinicLocation,
  ClinicNotifications,
  ClinicPaymentConfig,
  ClinicPosConfig,
  ClinicPrivacyConfig,
  ClinicRequest,
  ClinicResponse,
  CreateClinicLocationRequest,
  UpdateClinicNotificationsRequest,
  UpdateClinicPaymentConfigRequest,
  UpdateClinicPosConfigRequest,
  UpdateClinicPrivacyConfigRequest,
  UploadPaymentQrCodeResponse,
} from "@/types/clinic-types";

// ── Clinic profile ────────────────────────────────────────────────────────────

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

/**
 * Merges a partial update over the admin's own clinic and PATCHes it — the
 * endpoint requires the full body. Convenience for settings tabs that only
 * ever touch their own slice of the profile (e.g. just low_stock_notifications).
 */
export async function patchOwnClinic(partial: Partial<ClinicRequest>): Promise<ClinicResponse> {
  const current = await getClinic();
  const body: ClinicRequest = {
    clinic_name: current.clinic_name,
    registration_no: current.registration_no,
    tagline: current.tagline,
    address: current.address,
    phone: current.phone,
    email: current.email,
    report_footer: current.report_footer,
    workspace_slug: current.workspace_slug,
    default_currency: current.default_currency,
    timezone: current.timezone,
    require_consent_before_exam: current.require_consent_before_exam,
    low_stock_notifications: current.low_stock_notifications,
    ...partial,
  };
  await updateClinic(current.id, body);
  return { ...current, ...body };
}

// ── Locations — GET/POST /admin/clinic/locations (multi-row, append-only) ───

export function listClinicLocations(): Promise<ClinicLocation[]> {
  return apiFetch<ClinicLocation[]>("/admin/clinic/locations");
}

export function createClinicLocation(body: CreateClinicLocationRequest): Promise<ClinicLocation> {
  return apiFetch<ClinicLocation>("/admin/clinic/locations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Notifications — GET/PUT /admin/clinic/notifications ─────────────────────

export function getClinicNotifications(): Promise<ClinicNotifications> {
  return apiFetch<ClinicNotifications>("/admin/clinic/notifications");
}

export function updateClinicNotifications(
  body: UpdateClinicNotificationsRequest
): Promise<ClinicNotifications> {
  return apiFetch<ClinicNotifications>("/admin/clinic/notifications", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ── Payment config — GET/PUT /admin/clinic/payment-config, ──────────────────
// POST /admin/clinic/payment-config/qr-code

export function getPaymentConfig(): Promise<ClinicPaymentConfig> {
  return apiFetch<ClinicPaymentConfig>("/admin/clinic/payment-config");
}

export function updatePaymentConfig(
  body: UpdateClinicPaymentConfigRequest
): Promise<ClinicPaymentConfig> {
  return apiFetch<ClinicPaymentConfig>("/admin/clinic/payment-config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** POST /admin/clinic/payment-config/qr-code — multipart upload; returns the public URL to store as qr_code_url. */
export function uploadPaymentQrCode(file: File): Promise<UploadPaymentQrCodeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadPaymentQrCodeResponse>("/admin/clinic/payment-config/qr-code", {
    method: "POST",
    body: formData,
  });
}

// ── POS config — GET/PUT /admin/clinic/pos-config ────────────────────────────

export function getPosConfig(): Promise<ClinicPosConfig> {
  return apiFetch<ClinicPosConfig>("/admin/clinic/pos-config");
}

export function updatePosConfig(body: UpdateClinicPosConfigRequest): Promise<ClinicPosConfig> {
  return apiFetch<ClinicPosConfig>("/admin/clinic/pos-config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ── Privacy config + audit log ───────────────────────────────────────────────

export function getPrivacyConfig(): Promise<ClinicPrivacyConfig> {
  return apiFetch<ClinicPrivacyConfig>("/admin/clinic/privacy-config");
}

export function updatePrivacyConfig(
  body: UpdateClinicPrivacyConfigRequest
): Promise<ClinicPrivacyConfig> {
  return apiFetch<ClinicPrivacyConfig>("/admin/clinic/privacy-config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** GET /admin/clinic/audit-log — read-only; nothing writes to it yet, so this will usually come back empty. */
export function getAuditLog(): Promise<ClinicAuditLogEntry[]> {
  return apiFetch<ClinicAuditLogEntry[]>("/admin/clinic/audit-log");
}

// ── Integrations — GET /admin/clinic/integrations, ──────────────────────────
// POST .../:provider/connect, DELETE .../:provider

export function listIntegrations(): Promise<ClinicIntegration[]> {
  return apiFetch<ClinicIntegration[]>("/admin/clinic/integrations");
}

/** POST /admin/clinic/integrations/:provider/connect — stub: marks the row connected immediately, no real OAuth yet. */
export function connectIntegration(provider: ClinicIntegrationProvider): Promise<ClinicIntegration> {
  return apiFetch<ClinicIntegration>(`/admin/clinic/integrations/${provider}/connect`, {
    method: "POST",
  });
}

export function disconnectIntegration(provider: ClinicIntegrationProvider): Promise<void> {
  return apiFetch<void>(`/admin/clinic/integrations/${provider}`, { method: "DELETE" });
}

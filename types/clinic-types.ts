// Shapes for the /admin/clinic endpoints (and its sub-resources — locations,
// notifications, payment/pos/privacy config, audit log, integrations).
// Mirrors the Go backend contract served at ${BACKEND_URL}/swagger/doc.json.
// Routing note: every endpoint below lives under /admin/clinic/..., gated by
// adminMiddleware() + subscriptionMiddleware() — same as the base clinic
// profile endpoints.

export interface ClinicRequest {
  clinic_name: string;
  registration_no: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  report_footer?: string;
  workspace_slug?: string;
  default_currency?: string;
  timezone?: string;
  require_consent_before_exam?: boolean;
  low_stock_notifications?: boolean;
}

export interface Clinic extends ClinicRequest {
  id: string;
  updated_by?: string;
}

export type ClinicResponse = Clinic;

// ── Locations — GET/POST /admin/clinic/locations (multi-row, append-only) ───

export type ClinicLocationStatus = "active" | "opening_soon";

export interface ClinicLocation {
  id: string;
  name: string;
  address?: string;
  exam_rooms: number;
  status: ClinicLocationStatus;
  created_at: string;
}

export interface CreateClinicLocationRequest {
  name: string;
  address?: string;
  exam_rooms?: number;
  status?: ClinicLocationStatus;
}

// ── Notifications — GET/PUT /admin/clinic/notifications ─────────────────────
//
// Single row per clinic. Low-stock alerts live on the clinic profile itself
// (ClinicRequest.low_stock_notifications), not here.

export interface ClinicNotifications {
  email_notifications: boolean;
  sms_appointment_reminders: boolean;
  new_order_notifications: boolean;
  weekly_performance_digest: boolean;
}

export type UpdateClinicNotificationsRequest = ClinicNotifications;

// ── Payment config — GET/PUT /admin/clinic/payment-config, ──────────────────
// POST /admin/clinic/payment-config/qr-code
//
// Nested bank_details/qr_wallet are flattened into columns here, only
// populated in the response when actually set.

export interface ClinicPaymentConfig {
  cash_enabled: boolean;
  card_enabled: boolean;
  bank_transfer_enabled: boolean;
  qr_wallet_enabled: boolean;
  tax_label?: string;
  tax_rate?: string;
  vat_registration_no?: string;
  pan_number?: string;
  bank_name?: string;
  bank_account_holder?: string;
  bank_account_number?: string;
  bank_branch?: string;
  bank_swift_code?: string;
  qr_wallet_provider?: string;
  qr_wallet_merchant_id?: string;
  qr_code_url?: string;
}

export type UpdateClinicPaymentConfigRequest = ClinicPaymentConfig;

export interface UploadPaymentQrCodeResponse {
  qr_code_url: string;
}

// ── POS config — GET/PUT /admin/clinic/pos-config ────────────────────────────
//
// Same flat, mostly-boolean shape as payment/privacy config.

export interface ClinicPosConfig {
  auto_generate_barcode: boolean;
  enable_barcode_scanning: boolean;
  auto_print_receipt: boolean;
  require_refund_pin: boolean;
}

export type UpdateClinicPosConfigRequest = ClinicPosConfig;

// ── Privacy config + audit log ───────────────────────────────────────────────
// GET/PUT /admin/clinic/privacy-config, GET /admin/clinic/audit-log

export type ClinicRetentionPeriod = "7_years" | "10_years" | "indefinite";

export interface ClinicPrivacyConfig {
  retention_period: ClinicRetentionPeriod;
  auto_anonymize_after_retention: boolean;
  allow_data_export_requests: boolean;
  allow_deletion_requests: boolean;
  require_two_factor: boolean;
  auto_session_timeout: boolean;
  login_alerts: boolean;
}

export type UpdateClinicPrivacyConfigRequest = ClinicPrivacyConfig;

// Read path only — nothing in the app writes to this yet.
export interface ClinicAuditLogEntry {
  id: string;
  actor_name: string;
  action: string;
  target?: string;
  created_at: string;
}

// ── Integrations — GET /admin/clinic/integrations, ──────────────────────────
// POST .../:provider/connect, DELETE .../:provider
//
// GET always lists all 4 known providers. Connect is a stub — it marks the
// row connected immediately rather than running real OAuth. Token columns
// exist on the backend but the read path never selects them.

export type ClinicIntegrationProvider = "xero" | "twilio" | "google_calendar" | "essilor_connect";

export interface ClinicIntegration {
  provider: ClinicIntegrationProvider;
  connected: boolean;
  connected_at?: string;
}

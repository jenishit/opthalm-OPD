// Mirrors the Go backend contract served at ${BACKEND_URL}/swagger/doc.json
// (Swagger 2.0; schemas live under `definitions`).
//
// Envelope on success: { success, message, data }
// Envelope on error:   { success: false, messages: [] }
//
// Only auth endpoints are public. Everything else requires a Bearer token,
// and most also require the clinic's subscription to be active (HTTP 402).

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  messages: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
  user_id: string;
  user_type: string;
}

export interface SignupRequest {
  clinic_name: string;
  registration_no: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_password: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  new_password: string;
}

export interface ConfirmEmailVerificationRequest {
  token: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Profile
// ────────────────────────────────────────────────────────────────────────────

export interface ProfileDTO {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_name: string;
  email: string;
}

export type ProfileResponse = ProfileDTO;

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_name?: string;
  email?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Patient
// ────────────────────────────────────────────────────────────────────────────

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
  createdBy?: string;
  created_at: string;
}

export type PatientResponse = PatientDTO;

export interface CreatePatientRequest {
  full_name: string;
  dob: string;
  gender?: string;
  phone: string;
  occupation?: string;
  email?: string;
  address?: string;
}

// PATCH /patient/:id reuses the create body (dob/full_name/phone are required).
export type UpdatePatientRequest = CreatePatientRequest & {
  email?: string;
};

// ────────────────────────────────────────────────────────────────────────────
// Visit
// ────────────────────────────────────────────────────────────────────────────

export type VisitStatusDTO = "scheduled" | "waiting" | "examining" | "completed" | "cancelled";

export interface EntityRefDTO {
  id: string;
  name: string;
}

export type PatientRefDTO = {
  id: string;
  name: string;
};

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

// POST /visit → examine_by comes back as the plain string that was sent.
export interface VisitCreateDTO {
  id: string;
  patient_id: string;
  examine_by: string;
  status: VisitStatusDTO;
  visit_date: string;
  chief_complaint: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

// POST /visit and PATCH /visit/:id both take this shape (PATCH reuses it).
export interface VisitUpsertRequest {
  patient_id: string;
  examine_by: string;
  status: VisitStatusDTO;
  visit_date: string;
  chief_complaint: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Clinic & catalogs (admin)
// ────────────────────────────────────────────────────────────────────────────

export interface ClinicRequest {
  clinic_name: string;
  registration_no: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  report_footer?: string;
}

export interface ClinicDTO extends ClinicRequest {
  id: string;
  updated_by?: string;
}

export type ClinicResponse = ClinicDTO;

export interface MedicineDTO {
  id: string;
  medicine_name: string;
  brand_name: string;
  strength: string;
  form: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateMedicineRequest {
  medicine_name?: string;
  brand_name?: string;
  strength?: string;
  form?: string;
}

export interface DiagnosisDTO {
  id: string;
  name: string;
  icd10_code: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateDiagnosisRequest {
  name?: string;
  icd10_code?: string;
}

export interface HistoryConditionDTO {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type ConditionDTO = HistoryConditionDTO;

export interface UpdateConditionRequest {
  name?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Billing
// ────────────────────────────────────────────────────────────────────────────

export type InvoiceItemType = "frame" | "lens" | "coating" | "contact_lens" | "service" | "other";
export type PaymentMethod = "cash" | "card" | "online" | "bank_transfer";
export type InvoiceStatus = "draft" | "finalized" | "cancelled";

export interface CreateInvoiceItemRequest {
  item_type: InvoiceItemType;
  description: string;
  bundle_id?: string;
  inventory_item_id?: string;
  quantity: number; // >= 1
  unit_price: number; // >= 0
  discount_amount?: number;
}

export interface CreateInvoiceRequest {
  patient_id: string;
  visit_id?: string;
  discount_amount?: number;
  tax_amount?: number;
  items: CreateInvoiceItemRequest[];
}

export interface InvoiceItemDTO {
  id: string;
  item_type: InvoiceItemType | string;
  description: string;
  bundle_id: string | null;
  inventory_item_id: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  created_at: string;
}

export interface InvoiceDTO {
  id: string;
  invoice_no: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  visit_id: string | null;
  status: InvoiceStatus | string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  items: InvoiceItemDTO[];
  payments: PaymentDTO[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type InvoiceResponse = InvoiceDTO;

export interface RecordPaymentRequest {
  amount: number; // > 0
  method: PaymentMethod;
  reference_no?: string;
}

export interface PaymentDTO {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod | string;
  reference_no: string | null;
  paid_at: string;
  created_at: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
}

export interface WhatsAppLinkDTO {
  link: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Inventory
// ────────────────────────────────────────────────────────────────────────────

export type InventoryCategory =
  | "frame"
  | "lens"
  | "contact_lens"
  | "sunglasses"
  | "coating"
  | "accessory"
  | "other";

export interface CreateInventoryItemRequest {
  category: InventoryCategory;
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  selling_price?: number;
  quantity_on_hand?: number;
  reorder_threshold?: number;
  unit?: string;
}

export interface UpdateInventoryItemRequest {
  category?: InventoryCategory;
  name?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  selling_price?: number;
  reorder_threshold?: number;
}

export interface InventoryItemDTO {
  id: string;
  category: InventoryCategory | string;
  sku: string;
  name: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  size: string | null;
  unit: string | null;
  cost_price: number;
  selling_price: number;
  quantity_on_hand: number;
  reorder_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddStockRequest {
  quantity: number;
  notes?: string;
}

export interface StockMovementDTO {
  id: string;
  inventory_item_id: string;
  movement_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateVendorRequest {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface VendorDTO {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseItemRequest {
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseRequest {
  vendor_id: string;
  invoice_ref_no?: string;
  paid_amount?: number;
  items: CreatePurchaseItemRequest[];
}

export interface PurchaseItemDTO {
  id: string;
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface PurchaseDTO {
  id: string;
  vendor_id: string;
  vendor_name: string;
  invoice_ref_no: string | null;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  items: PurchaseItemDTO[];
  created_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Lab jobs
// ────────────────────────────────────────────────────────────────────────────

export type LabJobStatus = "in_fitting" | "ready_to_deliver" | "delivered" | "cancelled";

export interface CreateLabJobRequest {
  patient_id: string;
  job_type: string;
  invoice_id?: string;
  invoice_item_id?: string;
  vendor_id?: string;
  expected_delivery_date?: string;
  advance_payment?: number;
  notes?: string;
}

export interface UpdateLabJobStatusRequest {
  status: LabJobStatus;
  notes?: string;
}

export interface LabJobStatusHistoryDTO {
  id: string;
  status: string;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

export interface LabJobDTO {
  id: string;
  patient_id: string;
  patient_name: string;
  job_type: string;
  invoice_id: string | null;
  invoice_item_id: string | null;
  vendor_id: string | null;
  vendor_name: string | null;
  status: LabJobStatus | string;
  expected_delivery_date: string | null;
  delivered_at: string | null;
  advance_payment: number;
  notes: string | null;
  history: LabJobStatusHistoryDTO[];
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Reports
// ────────────────────────────────────────────────────────────────────────────

export interface SalesSummaryDTO {
  period: string;
  invoice_count: number;
  subtotal: number;
  discount: number;
  tax: number;
  total_sales: number;
  total_paid: number;
  total_due: number;
}

export interface PatientDueDTO {
  invoice_no: string;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  created_at: string;
}

export interface VendorDueDTO {
  vendor_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  purchase_date: string;
}

export interface InventoryValuationDTO {
  total_items: number;
  total_units: number;
  total_cost_value: number;
  total_sell_value: number;
}

export interface VisitsSummaryDTO {
  period: string;
  visit_count: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Calculators
// ────────────────────────────────────────────────────────────────────────────

export interface TranspositionRequest {
  sphere: number;
  cylinder: number;
  axis: number;
}

export interface TranspositionResult {
  sphere: number;
  cylinder: number;
  axis: number;
}

export interface SphericalEquivalentRequest {
  sphere: number;
  cylinder: number;
}

export interface NearAddRequest {
  distance_sphere: number;
  add_power: number;
}

export interface VertexDistanceRequest {
  power: number;
  from_distance_mm: number;
  to_distance_mm: number;
}

export interface TelescopeFovRequest {
  true_fov_degrees: number;
  magnification: number;
}

export interface ScalarResult {
  result: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Admin: roles, users, platform subscriptions
// ────────────────────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  role_name: string;
}

export interface RoleDTO {
  id: string;
  roleName: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role_name: string;
}

export interface UserDTO {
  id: string;
  clinicID: string;
  roleID: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export interface UpsertSubscriptionRequest {
  plan_name?: string;
  status: SubscriptionStatus;
  current_period_end: string; // "YYYY-MM-DD"
}

export interface SubscriptionDTO {
  id: string;
  clinic_id: string;
  plan_name: string | null;
  status: SubscriptionStatus | string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

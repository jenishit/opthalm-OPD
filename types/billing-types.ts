// Shapes for the /billing endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json.

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

export interface InvoiceItem {
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

export interface Invoice {
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
  items: InvoiceItem[];
  payments: Payment[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type InvoiceResponse = Invoice;

export interface RecordPaymentRequest {
  amount: number; // > 0
  method: PaymentMethod;
  reference_no?: string;
}

export interface Payment {
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

export interface WhatsAppLink {
  link: string;
}

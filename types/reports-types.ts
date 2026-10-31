// Shapes for the /reports endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json.

export interface SalesSummary {
  period: string;
  invoice_count: number;
  subtotal: number;
  discount: number;
  tax: number;
  total_sales: number;
  total_paid: number;
  total_due: number;
}

export interface PatientDue {
  invoice_no: string;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  created_at: string;
}

export interface VendorDue {
  vendor_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  purchase_date: string;
}

export interface InventoryValuation {
  total_items: number;
  total_units: number;
  total_cost_value: number;
  total_sell_value: number;
}

export interface VisitsSummary {
  period: string;
  visit_count: number;
}

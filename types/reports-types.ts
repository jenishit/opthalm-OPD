// Shapes for the /reports endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json.

import type { InventoryCategory } from "@/types/inventory-types";

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

// GET /reports/sales/by-category — grouped by inventory_items.category, not
// invoice_items.item_type (which has no "sunglasses" value). Line items with
// no linked inventory item (pure services) aren't part of this breakdown —
// that's what sales-summary covers.
export interface SalesByCategory {
  category: InventoryCategory;
  item_count: number;
  total_sales: number;
}

// GET /reports/clinical-activity — follow_up_visits counts follow-ups *due*
// in the range (follow_ups.followup_date), not confirmed follow-up visits
// that occurred: nothing in the schema marks a visit as itself having been a
// follow-up.
export interface ClinicalActivity {
  new_patients: number;
  comprehensive_exams: number;
  refraction_visits: number;
  follow_up_visits: number;
}

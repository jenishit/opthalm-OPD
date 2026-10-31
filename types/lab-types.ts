// Shapes for the /lab-jobs endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json.

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

export interface LabJobStatusHistory {
  id: string;
  status: string;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

export interface LabJob {
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
  history: LabJobStatusHistory[];
  created_at: string;
  updated_at: string;
}

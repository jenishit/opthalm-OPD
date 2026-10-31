// Shapes for the /admin/clinic endpoints. Mirrors the Go backend contract
// served at ${BACKEND_URL}/swagger/doc.json.

export interface ClinicRequest {
  clinic_name: string;
  registration_no: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  report_footer?: string;
}

export interface Clinic extends ClinicRequest {
  id: string;
  updated_by?: string;
}

export type ClinicResponse = Clinic;

// Shapes for the /platform/analytics endpoints. These are platform-operator
// (ROLE_SUPERADMIN) views across every tenant. Mirrors the Go backend's
// dto/platform.go.

export interface PlatformPeriod {
  from: string;
  to: string;
}

export interface PlatformTotals {
  clinics: number;
  active_clinics: number;
  trialing_clinics: number;
  /** Signed up self-serve, not yet activated by the platform operator. */
  pending_clinics: number;
  past_due_clinics: number;
  cancelled_clinics: number;
  no_plan_clinics: number;
  users: number;
  staff_users: number;
  portal_users: number;
  patients: number;
  visits: number;
  invoices: number;
  revenue: number;
  collected: number;
  outstanding: number;
}

export interface PlatformPeriodStats {
  new_users: number;
  new_patients: number;
  visits: number;
  invoices: number;
  revenue: number;
  collected: number;
}

export interface PlatformRevenuePoint {
  period: string;
  revenue: number;
  collected: number;
}

export interface PlatformSubscriptionUsage {
  plan_name: string;
  status: string;
  current_period_end: string;
  seats_limit: number | null;
  seats_used: number;
  patient_records_limit: number | null;
  patient_records_used: number;
  locations_limit: number | null;
  locations_used: number;
}

export interface PlatformClinicUsage {
  id: string;
  clinic_name: string;
  workspace_slug: string;
  email: string;
  phone: string;
  last_activity_at: string | null;
  users: number;
  patients: number;
  visits: number;
  invoices: number;
  revenue: number;
  collected: number;
  outstanding: number;
  period_patients: number;
  period_visits: number;
  period_invoices: number;
  period_revenue: number;
  period_collected: number;
  subscription: PlatformSubscriptionUsage | null;
}

export interface PlatformRoleCount {
  role_name: string;
  count: number;
}

export interface PlatformOverview {
  generated_at: string;
  period: PlatformPeriod;
  totals: PlatformTotals;
  period_stats: PlatformPeriodStats;
  revenue_trend: PlatformRevenuePoint[];
  clinics: PlatformClinicUsage[];
  role_breakdown: PlatformRoleCount[];
}

export interface PlatformClinicLocation {
  id: string;
  name: string;
  address: string;
  exam_rooms: number;
  status: string;
  created_at: string;
}

export interface PlatformUserStats {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_name: string;
  clinic_id: string;
  clinic_name: string;
  created_at: string;
  patients_registered: number;
  visits_examined: number;
  invoices_created: number;
  revenue_collected: number;
}

export interface PlatformClinicDetail {
  clinic: PlatformClinicUsage;
  address: string;
  registration_no: string;
  locations: PlatformClinicLocation[];
  staff: PlatformUserStats[];
  revenue_trend: PlatformRevenuePoint[];
}

export interface PlatformUserTotals {
  users: number;
  staff_users: number;
  portal_users: number;
  superadmins: number;
}

export interface PlatformUsers {
  users: PlatformUserStats[];
  totals: PlatformUserTotals;
  role_breakdown: PlatformRoleCount[];
}

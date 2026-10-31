// Shapes for the /role, /user and /platform/subscriptions endpoints. Mirrors
// the Go backend contract served at ${BACKEND_URL}/swagger/doc.json.

export interface CreateRoleRequest {
  role_name: string;
}

export interface Role {
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

export interface User {
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

export interface Subscription {
  id: string;
  clinic_id: string;
  plan_name: string | null;
  status: SubscriptionStatus | string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

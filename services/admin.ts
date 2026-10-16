import { apiFetch } from "./http";
import type {
  CreateRoleRequest,
  RoleDTO,
  CreateUserRequest,
  UserDTO,
  SubscriptionDTO,
  SubscriptionStatus,
  UpsertSubscriptionRequest,
} from "@/types/api";

// ── Admin: roles & users ────────────────────────────────────────────────────

/** POST /role/create 🔒 admin */
export function createRole(body: CreateRoleRequest): Promise<RoleDTO> {
  return apiFetch<RoleDTO>("/role/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /user/create 🔒 admin */
export function createUser(body: CreateUserRequest): Promise<UserDTO> {
  return apiFetch<UserDTO>("/user/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Platform: subscriptions 🔒 superadmin ───────────────────────────────────

/** GET /platform/subscriptions/:clinicId */
export function getSubscription(clinicId: string): Promise<SubscriptionDTO> {
  return apiFetch<SubscriptionDTO>(`/platform/subscriptions/${clinicId}`);
}

/** PUT /platform/subscriptions/:clinicId — create or update. */
export function upsertSubscription(
  clinicId: string,
  body: UpsertSubscriptionRequest
): Promise<SubscriptionDTO> {
  return apiFetch<SubscriptionDTO>(`/platform/subscriptions/${clinicId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Convenience for the platform console: flip a clinic to active/trialing/etc. */
export function activateSubscription(
  clinicId: string,
  planName: string,
  currentPeriodEnd: string,
  status: SubscriptionStatus = "active"
): Promise<SubscriptionDTO> {
  return upsertSubscription(clinicId, {
    plan_name: planName,
    status,
    current_period_end: currentPeriodEnd,
  });
}

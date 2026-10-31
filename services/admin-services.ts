import { apiFetch } from "./http";
import type {
  CreateRoleRequest,
  Role,
  CreateUserRequest,
  User,
  Subscription,
  SubscriptionStatus,
  UpsertSubscriptionRequest,
} from "@/types/admin-types";

export function createRole(body: CreateRoleRequest): Promise<Role> {
  return apiFetch<Role>("/role/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createUser(body: CreateUserRequest): Promise<User> {
  return apiFetch<User>("/user/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /platform/subscriptions/:clinicId */
export function getSubscription(clinicId: string): Promise<Subscription> {
  return apiFetch<Subscription>(`/platform/subscriptions/${clinicId}`);
}

/** PUT /platform/subscriptions/:clinicId — create or update. */
export function upsertSubscription(
  clinicId: string,
  body: UpsertSubscriptionRequest
): Promise<Subscription> {
  return apiFetch<Subscription>(`/platform/subscriptions/${clinicId}`, {
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
): Promise<Subscription> {
  return upsertSubscription(clinicId, {
    plan_name: planName,
    status,
    current_period_end: currentPeriodEnd,
  });
}

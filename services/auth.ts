import { apiFetch } from "./http";
import type { LoginRequest, LoginResponse, ProfileResponse } from "@/types/api";

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMyProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/getme");
}

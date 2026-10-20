import { apiFetch } from "./http";
import type { ProfileResponse, UpdateProfileRequest } from "@/types/api";

/** GET /profile/getme — the current authenticated user's profile. */
export function getMyProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/getme");
}

/** GET /profile/profile-details */
export function getProfileDetails(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/profile-details");
}

/** GET /profile/search?query&limit */
export function searchProfiles(query: string, limit = 50): Promise<ProfileResponse[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<ProfileResponse[]>(`/profile/search?${params.toString()}`);
}

/** PATCH /profile/update-profile/:id — returns a message. */
export function updateProfile(id: string, body: UpdateProfileRequest): Promise<void> {
  return apiFetch<void>(`/profile/update-profile/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

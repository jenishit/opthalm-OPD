// Shapes for the /profile endpoints. Mirrors the Go backend contract served
// at ${BACKEND_URL}/swagger/doc.json.

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_name: string;
  email: string;
}

export type ProfileResponse = Profile;

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_name?: string;
  email?: string;
}

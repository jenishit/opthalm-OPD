/**
 * The clinic (tenant) id carried in the backend's access token (`clinic_id` claim).
 * The backend has no "my clinic" endpoint — only `/admin/clinic/:id` — so the
 * frontend reads its own id from the token. This is only used to build the URL;
 * the server enforces the tenant from the verified token, so a forged claim gains nothing.
 */
export function clinicIdFromToken(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    const id = (JSON.parse(json) as { clinic_id?: unknown }).clinic_id;
    return typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  } catch {
    return null;
  }
}

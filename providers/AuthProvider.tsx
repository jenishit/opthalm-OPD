"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import type { Staff } from "@/schemas/shared-schema";
import { useAuthStore } from "@/stores/authStore";

/**
 * Bridges the next-auth session (JWT cookie, source of truth) into the
 * zustand auth store that the rest of the app reads (services/http.ts,
 * StaffAuthGuard). Staff sessions only — the patient portal keeps its own
 * OTP/QR session in the same store and is never touched here.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait for the session to settle before deciding anything.
    if (status === "loading") return;

    const token = session?.accessToken;
    if (status === "unauthenticated" || !token) {
      // Only clear the staff half — portal sessions are independent.
      useAuthStore.getState().logoutStaff();
      return;
    }

    const staff = session.staff as Staff | undefined;

    // The NextAuth cookie is never updated after login — apiFetch's
    // refreshAccessToken() rotates the live pair directly into this store.
    // Only seed from the cookie when the store has no token yet (fresh
    // sign-in or post-logout); otherwise a stale refetch of the old cookie
    // would clobber an already-rotated pair with an already-used refresh
    // token, and the backend permanently revokes all sessions on reuse.
    if (!useAuthStore.getState().accessToken) {
      useAuthStore.getState().setAuthTokens(token, session.refreshToken ?? "");
    }

    if (staff) {
      useAuthStore.getState().loginStaff(staff);
    }
  }, [status, session?.accessToken, session?.refreshToken, session?.staff]);

  return <>{children}</>;
}

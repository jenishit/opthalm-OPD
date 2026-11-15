import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Staff } from "@/schemas/shared-schema";
import type { Patient } from "@/schemas/patient-schema";

interface AuthState {
  staffUser: Staff | null;
  accessToken: string | null;
  refreshToken: string | null;
  portalPatient: Patient | null;
  authMethod: "otp" | "qr" | null;
  sessionToken: string | null;
  setAccessToken: (token: string) => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  loginStaff: (staff: Staff) => void;
  logoutStaff: () => void;
  loginPortalPatient: (patient: Patient, method: "otp" | "qr", token: string) => void;
  logoutPortal: () => void;
}

/**
 * Staff credentials (access/refresh tokens, staff identity) are held in
 * memory ONLY — they are re-seeded from the encrypted NextAuth cookie by
 * AuthProvider on every load. Persisting them to localStorage would expose
 * them to any script running on the page (XSS → account takeover).
 *
 * Only the patient-portal session is persisted, and to sessionStorage (cleared
 * when the tab closes) rather than localStorage, since it holds PHI.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      staffUser: null,
      accessToken: null,
      refreshToken: null,
      portalPatient: null,
      authMethod: null,
      sessionToken: null,

      setAccessToken: (token) => set({ accessToken: token }),
      setAuthTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      loginStaff: (staff) => set({ staffUser: staff }),
      logoutStaff: () =>
        set({ staffUser: null, accessToken: null, refreshToken: null }),

      loginPortalPatient: (patient, method, token) =>
        set({
          portalPatient: patient,
          authMethod: method,
          sessionToken: token,
        }),
      logoutPortal: () =>
        set({
          portalPatient: null,
          authMethod: null,
          sessionToken: null,
        }),
    }),
    {
      name: "eye-clinic-portal-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        portalPatient: state.portalPatient,
        authMethod: state.authMethod,
        sessionToken: state.sessionToken,
      }),
    }
  )
);

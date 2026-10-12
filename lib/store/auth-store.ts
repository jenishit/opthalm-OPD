import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Staff } from "@/lib/schemas/shared.schema";
import type { Patient } from "@/lib/schemas/patient.schema";

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
      name: "eye-clinic-auth-storage",
    }
  )
);

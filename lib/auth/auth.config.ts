import { loginSchema } from "@/schemas/login-schema";
import type { ApiEnvelope, LoginResponse, ProfileResponse } from "@/types/api-types";
import type { NextAuthConfig } from "next-auth";
import { staffRole } from "@/schemas/shared-schema";
import type { Staff } from "@/schemas/shared-schema";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8082";

/**
 * Map the backend's free-form role_name (e.g. "role_doctor") onto the app's
 * staff role union. Unknown roles fall back to receptionist — the least
 * privileged surface.
 */
function toStaffRole(roleName: string): Staff["role"] {
  const normalized = roleName.toLowerCase().replace(/^role_/, "");
  return staffRole.find((r) => normalized.includes(r)) ?? "receptionist";
}

export const authConfig: NextAuthConfig = {
  // Required when the app runs behind a proxy or on a non-standard host.
  trustHost: true,

  // Matches the catch-all route location (app/api/nextauth/[...nextauth]) —
  // must stay in sync with <SessionProvider basePath> in app/layout.tsx.
  basePath: "/api/nextauth",

  secret: process.env.AUTH_SECRET,

  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {},
        password: {},
        remember: {},
      },

      /**
       * Talks to the OPD backend directly (not through the /api proxy —
       * that path is reserved for the browser). Two calls:
       *   1. POST /api/auth/login        → token pair
       *   2. GET  /api/profile/getme     → staff identity for the session
       */
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          remember: credentials?.remember === "true",
        });

        if (!parsed.success) return null;

        try {
          const loginRes = await fetch(`${backendBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(parsed.data),
            cache: "no-store",
          });

          const loginBody = (await loginRes
            .json()
            .catch(() => null)) as ApiEnvelope<LoginResponse> | null;

          if (!loginRes.ok || !loginBody?.success || !loginBody.data?.access_token) {
            console.warn("[next-auth] backend rejected login", {
              status: loginRes.status,
              message: loginBody?.message,
            });
            return null;
          }

          const tokens = loginBody.data;

          // Tokens came back but the profile call decides whether this is a
          // usable staff session (it also surfaces subscription problems
          // server-side instead of after the redirect).
          const profileRes = await fetch(`${backendBaseUrl}/api/profile/getme`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${tokens.access_token}`,
            },
            cache: "no-store",
          });

          const profile = (await profileRes
            .json()
            .catch(() => null)) as ApiEnvelope<ProfileResponse> | null;

          if (!profileRes.ok || !profile?.success || !profile.data) {
            console.warn("[next-auth] profile fetch failed after login", {
              status: profileRes.status,
              message: profile?.message,
            });
            return null;
          }

          const p = profile.data;

          return {
            id: tokens.user_id,
            name: `${p.first_name} ${p.last_name}`.trim(),
            email: p.email,
            role: toStaffRole(p.role_name),
            phone: p.phone ?? undefined,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            sessionId: tokens.session_id,
            userType: tokens.user_type,
          };
        } catch (error) {
          console.error("[next-auth] authorize() failed", error);
          return null;
        }
      },
    },
  ],

  // JWT sessions keep the backend token pair server-side in an encrypted
  // cookie; the browser never stores it (the zustand store is hydrated from
  // the session by providers/AuthProvider).
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.sessionId = user.sessionId;
        token.userType = user.userType;
        token.staff = {
          id: user.id ?? "",
          name: user.name ?? "",
          role: user.role ?? "receptionist",
          phone: user.phone ?? undefined,
          email: user.email ?? undefined,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.sessionId = token.sessionId;
      session.userType = token.userType;
      if (token.staff) session.staff = token.staff;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

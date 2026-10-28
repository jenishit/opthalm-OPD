import type { Staff } from "@/schemas/shared-schema";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    userType: string;
    /** Hydrated staff identity — the client store mirrors this. */
    staff?: Staff;
    user: DefaultSession["user"];
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    userType: string;
    role?: Staff["role"];
    phone?: string;
  }
}

// v5 re-exports next-auth/jwt from @auth/core — augment the declaring module
// so the merged JWT interface is the one the library actually uses.
declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    userType: string;
    staff?: Staff;
  }
}

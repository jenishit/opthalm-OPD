import { handlers } from "@/lib/auth/auth";

// Mounted at /api/nextauth (not /api/auth) on purpose: the backend serves its
// own /api/auth/login, /api/auth/refresh, ... endpoints through the /api proxy
// in next.config.ts, and this catch-all route would capture those paths first.
// Client helpers pick the base path up from <SessionProvider basePath>.
export async function GET(...args: Parameters<typeof handlers.GET>) {
  console.info("[next-auth] GET /api/nextauth/[...nextauth]");
  return handlers.GET(...args);
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  console.info("[next-auth] POST /api/nextauth/[...nextauth]");
  return handlers.POST(...args);
}

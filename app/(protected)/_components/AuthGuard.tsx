"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

/**
 * Client-side gate for the staff console (the server-side proxy already blocks
 * unauthenticated requests; this keeps the UI from rendering before the staff
 * identity is available).
 *
 * The staff tokens live in memory only, so after a page refresh the store is
 * empty until <AuthProvider> re-seeds it from the session cookie. The guard
 * therefore waits for the SESSION to settle and never treats "store not filled
 * yet" as "signed out" — doing so used to bounce a refresh to /login (which then
 * redirected to /dashboard because the cookie was still valid).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const seeded = useAuthStore((s) => Boolean(s.staffUser && s.accessToken));

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    // A session cookie without backend tokens can't call the API — sign out cleanly.
    if (status === "authenticated" && !session?.accessToken) void signOut({ callbackUrl: "/login" });
  }, [status, session?.accessToken, router]);

  if (status !== "authenticated" || !seeded) {
    return (
      <div role="status" aria-label="Loading" className="grid h-screen place-items-center bg-background text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export function StaffAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const authed = useAuthStore((state) => Boolean(state.staffUser && state.accessToken));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authed) router.replace("/staff/login");
  }, [mounted, authed, router]);

  if (!mounted || !authed) return null;
  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const authed = useAuthStore((state) => Boolean(state.staffUser && state.accessToken));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    router.replace(authed ? "/dashboard" : "/login");
  }, [mounted, authed, router]);

  return null;
}

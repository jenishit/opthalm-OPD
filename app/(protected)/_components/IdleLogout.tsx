"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const IDLE_MS = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES ?? 15) * 60_000;
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * Signs the staff member out after a period of inactivity so patient data is
 * not left open on a shared reception terminal. Activity in any tab resets
 * the timer via a localStorage heartbeat (no sensitive data is stored).
 */
export function IdleLogout() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const KEY = "opd-last-activity";

    const expire = () => {
      useAuthStore.getState().logoutStaff();
      toast.info("Signed out due to inactivity");
      signOut({ callbackUrl: "/login" });
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        let last = 0;
        try {
          last = Number(localStorage.getItem(KEY) ?? 0);
        } catch {}
        // Another tab was active more recently — keep waiting.
        if (Date.now() - last < IDLE_MS) arm();
        else expire();
      }, IDLE_MS);
    };
    const onActivity = () => {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {}
      arm();
    };

    onActivity();
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  return null;
}

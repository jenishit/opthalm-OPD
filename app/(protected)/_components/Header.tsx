"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, LogOut, Moon, Sun, Stethoscope, Receipt } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { logoutStaffSession } from "@/services/auth-services";
import { useUiStore } from "@/lib/store/ui";
import { useAuthStore } from "@/stores/authStore";

const TITLES: [RegExp, string][] = [
  [/^\/staff\/queue$/, "Queue board"],
  [/^\/staff\/patients$/, "Patients"],
  [/^\/staff\/patients\/register$/, "Patient registration"],
  [/^\/staff\/patients\/new$/, "New patient"],
  [/^\/staff\/patients\/[^/]+\/consult$/, "Consultation"],
  [/^\/staff\/patients\/[^/]+\/visits\/new$/, "New visit"],
  [/^\/staff\/patients\/[^/]+\/visits\/[^/]+$/, "Visit detail"],
  [/^\/staff\/patients\/[^/]+$/, "Patient record"],
  [/^\/staff\/consult$/, "Consultation"],
];

export function Header() {
  const pathname = usePathname();
  const { setSidebarCollapsed } = useUiStore();
  const { staffUser } = useAuthStore();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title =
    TITLES.find(([re]) => re.test(pathname))?.[1] ??
    (pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Home")
      .charAt(0)
      .toUpperCase() +
      (pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "")
        .slice(1);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleLogout = async () => {
    // Revoke the backend session first (needs the in-store access token),
    // then clear the next-auth JWT cookie and return to the login page.
    await logoutStaffSession();
    await signOut({ redirectTo: "/login" });
  };

  const isDoctor = staffUser?.role === "doctor";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-card px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="grid size-11 shrink-0 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </button>

        <div className="min-w-0">
          <div className="mono-label truncate">{dateLabel}</div>
          <h1 className="truncate font-display text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {staffUser && (
          <span className="pill pill-mute !hidden !px-3 !py-1.5 sm:!inline-flex">
            {isDoctor ? (
              <Stethoscope className="size-3.5" />
            ) : (
              <Receipt className="size-3.5" />
            )}
            {staffUser.role} view
          </span>
        )}

        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="grid size-11 place-items-center rounded-md border border-line bg-card text-ink hover:border-sage"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>

        {staffUser && (
          <div className="flex items-center gap-2.5">
            <div className="hidden text-right text-sm md:block">
              <div className="font-semibold text-foreground">
                {staffUser.name}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-mute">
                {staffUser.role}
              </div>
            </div>
            <div className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-sage-soft font-semibold text-sage">
              {staffUser.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="grid size-11 place-items-center rounded-md border border-line bg-card text-ink transition-colors hover:border-sage"
              title="Log out"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

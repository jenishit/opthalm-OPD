"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, LogOut, Moon, Sun, Stethoscope, Receipt } from "lucide-react";
import { useTheme } from "next-themes";
import { logoutStaffSession } from "@/services/auth";
import { useUiStore } from "@/lib/store/ui-store";
import { useAuthStore } from "@/lib/store/auth-store";

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

export function StaffHeader() {
  const pathname = usePathname();
  const router = useRouter();
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
    await logoutStaffSession();
    router.push("/staff/login");
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

        <nav className="hidden text-sm font-medium text-muted-foreground sm:flex">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-border">/</span>}
                <span className={crumb.isLast ? "text-foreground" : ""}>
                  {crumb.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {staffUser ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm md:block">
              <div className="font-medium text-foreground">{staffUser.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{staffUser.role}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {staffUser.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="text-sm font-medium text-accent">Not logged in</div>
        )}
      </div>
    </header>
  );
}


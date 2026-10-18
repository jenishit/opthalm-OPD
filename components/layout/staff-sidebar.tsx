"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListTodo,
  X,
  Eye,
  UserRoundPlus,
  Stethoscope,
  Users,
} from "lucide-react";
import { useUiStore } from "@/lib/store/ui-store";

export function StaffSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();

  const links = [
    {
      href: "/staff/queue",
      label: "Queue",
      icon: ListTodo,
      active: pathname === "/staff/queue",
    },
    {
      href: "/staff/patients",
      label: "Patients",
      icon: Users,
      active:
        pathname.startsWith("/staff/patients") &&
        !/(register|new|consult|visits\/new)$/.test(pathname),
    },
    {
      href: "/staff/patients/register",
      label: "Register",
      icon: UserRoundPlus,
      active: /\/(register|new)$/.test(pathname),
    },
    {
      href: "/staff/consult",
      label: "Consult",
      icon: Stethoscope,
      active:
        pathname === "/staff/consult" ||
        /\/(consult|visits\/new)$/.test(pathname),
    },
  ];

  return (
    <>
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-card text-foreground transition-transform duration-300 ease-in-out
          md:static md:w-[84px] md:shrink-0 md:translate-x-0 md:border-0 md:bg-transparent
          ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-5 md:mb-2 md:justify-center md:px-0">
          <div className="flex items-center gap-2 font-display text-lg font-semibold md:size-12 md:items-center md:justify-center md:rounded-full md:bg-primary md:text-primary-foreground">
            <Eye className="size-[26px]" />
            <span className="text-ink md:sr-only">EyeClinic OPD</span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="rounded-md p-1 text-mute hover:bg-sage-soft hover:text-ink md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Staff navigation"
          className="flex flex-1 flex-col gap-1 px-3 py-2 md:px-0 md:pt-0"
        >
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.active;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 md:mx-auto md:min-w-[66px] md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-[11px] md:leading-tight
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-mute hover:bg-sage-soft hover:text-ink"
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarCollapsed(true);
                  }
                }}
              >
                <Icon className="size-6 shrink-0 md:size-[23px]" />
                <span className="md:max-w-full md:truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-mute md:hidden">EyeClinic OPD</div>
      </aside>
    </>
  );
}

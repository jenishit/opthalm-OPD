"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ListTodo, X, Eye } from "lucide-react";
import { useUiStore } from "@/lib/store/ui-store";

export function StaffSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();

  const links = [
    { href: "/staff/queue", label: "Queue Board", icon: ListTodo },
    { href: "/staff/patients", label: "Patients", icon: Users },
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
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-primary-foreground transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:rounded-r-3xl
          ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-display text-lg font-medium">
            <Eye className="h-6 w-6" />
            <span>EyeClinic OPD</span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="rounded-full p-1 hover:bg-primary-foreground/10 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary-foreground/50
                  ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarCollapsed(true);
                  }
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-primary-foreground/50">
          Staff App v1.0
        </div>
      </aside>
    </>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { useUiStore } from "@/lib/store/ui-store";
import { useAuthStore } from "@/lib/store/auth-store";

const ID_PARENTS = ["patients", "visits"];
const NON_ID_SEGMENTS = ["new", "edit"];

export function StaffHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setSidebarCollapsed } = useUiStore();
  const { staffUser, logoutStaff } = useAuthStore();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const parent = segments[index - 1];
    const isId = ID_PARENTS.includes(parent ?? "") && !NON_ID_SEGMENTS.includes(segment);
    const label = segment === "staff"
      ? "Home"
      : isId
        ? `ID: ${segment.substring(0, 6)}`
        : segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      label,
      isLast: index === segments.length - 1,
    };
  });

  const handleLogout = () => {
    logoutStaff();
    router.push("/staff/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="-ml-2 rounded-full p-2 text-muted-foreground hover:bg-muted md:hidden"
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


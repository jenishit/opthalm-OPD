"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  X,
  Eye,
  Users,
  LayoutDashboard,
  CalendarDays,
  FileText,
  Package,
  ShoppingCart,
  ShoppingBag,
  Truck,
  ChartNoAxesCombined,
  ShieldCheck,
  Gauge,
  Building2,
  Settings,
  LifeBuoy,
  ArrowUpRight,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { useUiStore } from "@/lib/store/ui";
import { useAuthStore } from "@/stores/authStore";
import { canAccess } from "@/lib/permissions";
import { useNavBadges } from "@/lib/hooks/use-nav-badges";
import { logoutStaffSession } from "@/services/auth-services";
import { getClinic } from "@/services/clinic-services";
import type { Clinic } from "@/types/clinic-types";
import { cn } from "@/lib/utils";
import { OpthalmOKLogo } from "@/app/(auth)/_components/OpthalmOKLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

const NAV = [
  {
    group: "Workspace",
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  { group: "Care", href: "/patients", label: "Patients", icon: Users },
  {
    group: "Care",
    href: "/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  { group: "Care", href: "/examinations", label: "Examinations", icon: Eye },
  {
    group: "Care",
    href: "/prescriptions",
    label: "Prescriptions",
    icon: FileText,
  },
  { group: "Optical", href: "/inventory", label: "Inventory", icon: Package },
  { group: "Optical", href: "/pos", label: "POS & Sales", icon: ShoppingCart },
  {
    group: "Optical",
    href: "/customer-orders",
    label: "Customer Orders",
    icon: ShoppingBag,
  },
  { group: "Optical", href: "/orders", label: "Supplier Purchases", icon: Truck },
  {
    group: "Manage",
    href: "/reports",
    label: "Reports",
    icon: ChartNoAxesCombined,
  },
  { group: "Manage", href: "/teams", label: "Team & Roles", icon: ShieldCheck },
  { group: "Manage", href: "/settings", label: "Settings", icon: Settings },
  { group: "Platform", href: "/platform", label: "Overview", icon: Gauge },
  { group: "Platform", href: "/platform/clinics", label: "Clinics", icon: Building2 },
  { group: "Platform", href: "/platform/users", label: "Accounts", icon: Users },
] as const;

const GROUPS = ["Workspace", "Care", "Optical", "Manage", "Platform"] as const;

/** A nav item is active on its own page and any nested page below it. */
function isActivePath(pathname: string, href: string): boolean {
  // The platform overview is only itself; /platform/clinics is a sibling page.
  if (href === "/platform") return pathname === "/platform";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const { staffUser } = useAuthStore();
  // Show everything while the role hasn't resolved yet to avoid a flash of an empty sidebar.
  const accessToken = useAuthStore((s) => s.accessToken);
  const badges = useNavBadges(staffUser?.role, Boolean(accessToken));
  const visibleNav = staffUser ? NAV.filter((item) => canAccess(staffUser.role, item.href)) : NAV;
  // A freshly signed-up admin has no name until the setup wizard saves it, so
  // show the email instead of a blank avatar/name in the meantime.
  const displayName = staffUser?.name?.trim() || staffUser?.email?.trim() || "Staff";

  const [clinic, setClinic] = useState<Clinic | null>(null);
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    getClinic()
      .then((c) => !cancelled && setClinic(c))
      .catch(() => !cancelled && setClinic(null)); // not available (e.g. non-admin) → hide the card
    return () => {
      cancelled = true;
    };
  }, [accessToken]);
  const clinicName = clinic?.clinic_name?.trim();
  const clinicSub = clinic?.tagline?.trim() || clinic?.address?.trim();

  const handleLogout = async () => {
    await logoutStaffSession();
    await signOut({ redirectTo: "/login" });
  };

  return (
    <>
      {!sidebarCollapsed && (
        <button
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col gap-4 overflow-y-auto bg-side px-3 py-4 text-side-ink transition-transform duration-200 md:static md:translate-x-0",
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <button
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-md text-mute hover:bg-white/5 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div className="px-2 pt-1">
          <OpthalmOKLogo variant="dark" width={60} />
        </div>

        {/* Clinic card — only when the backend returns a clinic for this user */}
        {clinicName && (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            {clinic?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clinic.logo_url} alt="" className="size-9 shrink-0 rounded-lg bg-white object-contain" />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold font-display text-sm font-semibold text-gold-ink">
                {clinicName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm font-semibold text-white">{clinicName}</b>
              {clinicSub && <small className="block truncate text-xs text-mute">{clinicSub}</small>}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4">
          {GROUPS.filter((group) => visibleNav.some((item) => item.group === group)).map((group) => (
            <div key={group} className="flex flex-col gap-0.5">
              <span className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-side-mute">
                {group}
              </span>
              {visibleNav.filter((item) => item.group === group).map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarCollapsed(true)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-side-mute hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {badges[item.href] && (
                      <span
                        aria-label={badges[item.href].label}
                        title={badges[item.href].label}
                        className={cn(
                          "grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                          badges[item.href].tone === "info" ? "bg-white/10 text-side-ink" : "bg-gold text-gold-ink",
                        )}
                      >
                        {badges[item.href].count > 99 ? "99+" : badges[item.href].count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col gap-3">
          <Link
            href="/help"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-side-mute">
              <LifeBuoy size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-sm font-semibold text-white">
                Need a hand?
              </b>
              <small className="block text-xs text-mute">
                Visit our help centre
              </small>
            </span>
            <ArrowUpRight size={14} className="shrink-0 text-mute" />
          </Link>

          <div className="h-px bg-white/10" />

          {staffUser && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose font-display text-sm font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold text-white">
                    {displayName}
                  </b>
                  <small className="block truncate text-xs capitalize text-mute">
                    {staffUser.role}
                  </small>
                </span>
                <MoreHorizontal size={17} className="shrink-0 text-mute" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </>
  );
}

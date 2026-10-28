"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  ChevronDown,
  LifeBuoy,
  ArrowUpRight,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { useUiStore } from "@/lib/store/ui";
import { useAuthStore } from "@/stores/authStore";
import { logoutStaffSession } from "@/services/auth-services";
import { cn } from "@/lib/utils";
import { OpthalmOKLogo } from "@/app/(auth)/_components/OpthalmOKLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

const NAV = [
  { group: "Workspace", href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { group: "Care", href: "/patients", label: "Patients", icon: Users },
  { group: "Care", href: "/appointments", label: "Appointments", icon: CalendarDays },
  { group: "Care", href: "/examinations", label: "Examinations", icon: Eye },
  { group: "Care", href: "/prescriptions", label: "Prescriptions", icon: FileText, badge: "5" },
  { group: "Optical", href: "/inventory", label: "Inventory", icon: Package },
  { group: "Optical", href: "/sales", label: "POS & Sales", icon: ShoppingCart },
  {
    group: "Optical",
    href: "/customer-orders",
    label: "Customer Orders",
    icon: ShoppingBag,
    badge: "6",
    badgeMuted: true,
  },
  { group: "Optical", href: "/orders", label: "Supplier Orders", icon: Truck },
  { group: "Manage", href: "/reports", label: "Reports", icon: ChartNoAxesCombined },
  { group: "Manage", href: "/teams", label: "Team & Roles", icon: ShieldCheck },
  { group: "Manage", href: "/settings", label: "Settings", icon: Settings },
] as const;

const GROUPS = ["Workspace", "Care", "Optical", "Manage"] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const { staffUser } = useAuthStore();

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
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col gap-4 overflow-y-auto bg-[#182721] px-3 py-4 text-[#E7ECE4] transition-transform duration-200 md:static md:translate-x-0",
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <button
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-md text-[#9EAAA2] hover:bg-white/5 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div className="px-2 pt-1">
          <OpthalmOKLogo variant="dark" width={60} />
        </div>

        {/* Practice switcher */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#D9A441] font-display text-sm font-semibold text-[#2B2008]">
            C
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm font-semibold text-white">ClearView Clinic</b>
            <small className="block truncate text-xs text-[#9EAAA2]">
              Melbourne · Main practice
            </small>
          </span>
          <ChevronDown size={15} className="shrink-0 text-[#9EAAA2]" />
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4">
          {GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-0.5">
              <span className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#6F8075]">
                {group}
              </span>
              {NAV.filter((item) => item.group === group).map((item) => {
                const active = pathname === item.href;
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
                        : "text-[#B9C4BC] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span
                        className={cn(
                          "grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                          "badgeMuted" in item && item.badgeMuted
                            ? "bg-white/10 text-[#C7D2C9]"
                            : "bg-[#D9A441] text-[#2B2008]"
                        )}
                      >
                        {item.badge}
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
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[#B9C4BC]">
              <LifeBuoy size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-sm font-semibold text-white">Need a hand?</b>
              <small className="block text-xs text-[#9EAAA2]">Visit our help centre</small>
            </span>
            <ArrowUpRight size={14} className="shrink-0 text-[#9EAAA2]" />
          </Link>

          <div className="h-px bg-white/10" />

          {staffUser && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#D98BA0] font-display text-sm font-semibold text-white">
                  {staffUser.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold text-white">
                    {staffUser.name}
                  </b>
                  <small className="block truncate text-xs capitalize text-[#9EAAA2]">
                    {staffUser.role}
                  </small>
                </span>
                <MoreHorizontal size={17} className="shrink-0 text-[#9EAAA2]" />
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

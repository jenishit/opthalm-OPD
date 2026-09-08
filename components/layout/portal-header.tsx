"use client";

import { LogOut, Eye } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PortalHeader() {
  const router = useRouter();
  const { portalPatient, logoutPortal } = useAuthStore();

  const handleLogout = () => {
    logoutPortal();
    router.push("/portal/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-card px-4 md:px-6">
      <Link href="/portal" className="font-display flex items-center gap-2 text-lg font-medium text-foreground">
        <Eye className="h-6 w-6 text-primary" />
        <span>EyeClinic Portal</span>
      </Link>

      <div className="flex items-center gap-4">
        {portalPatient ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium text-foreground">
                {portalPatient.first_name} {portalPatient.last_name}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">
              {portalPatient.first_name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

import { AppSidebar } from "@/app/(protected)/_components/AppSidebar";
import { OfflineStatus } from "@/app/(protected)/_components/OfflineStatus";
import { IdleLogout } from "@/app/(protected)/_components/IdleLogout";
import { AccountStatus } from "@/app/(protected)/_components/AccountStatus";
import { AuthGuard } from "@/app/(protected)/_components/AuthGuard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <IdleLogout />
      <div className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
          <OfflineStatus />
          <AccountStatus />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

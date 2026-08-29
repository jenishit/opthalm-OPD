import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { StaffHeader } from "@/components/layout/staff-header";
import { StaffAuthGuard } from "@/components/layout/staff-auth-guard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffAuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <StaffSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <StaffHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </StaffAuthGuard>
  );
}

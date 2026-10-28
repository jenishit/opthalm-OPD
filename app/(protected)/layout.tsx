import { AppSidebar } from "@/app/(protected)/_components/AppSidebar";
import { Header } from "@/app/(protected)/_components/Header";
import { AuthGuard } from "@/app/(protected)/_components/AuthGuard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

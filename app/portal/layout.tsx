import { PortalHeader } from "@/components/layout/portal-header";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PortalHeader />
      <main className="flex-1 w-full max-w-md mx-auto p-4 sm:p-6 sm:max-w-xl md:max-w-2xl">
        {children}
      </main>
    </div>
  );
}

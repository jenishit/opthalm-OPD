import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline · Eye Clinic OPD" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <WifiOff className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page hasn&apos;t been opened on this device yet, so it isn&apos;t available offline. Pages you&apos;ve
          already visited — including the point of sale — keep working, and any sales are saved on this device and
          synced when the connection returns.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/pos" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            Go to point of sale
          </Link>
          <Link href="/dashboard" className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

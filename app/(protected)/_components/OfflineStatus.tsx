"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CloudOff, CloudUpload } from "lucide-react";
import { processOutbox } from "@/lib/offline/outbox";
import { useOnline } from "@/lib/offline/use-online";
import { useOutbox } from "@/lib/offline/use-outbox";
import { useAuthStore } from "@/stores/authStore";

const RETRY_MS = 60_000;

/**
 * Connectivity banner + background sync. Pushes queued POS sales to the
 * backend when the connection returns, on a slow timer while anything is
 * still queued, and on mount.
 */
export function OfflineStatus() {
  const online = useOnline();
  const { pending, failed } = useOutbox();
  const signedIn = useAuthStore((s) => Boolean(s.accessToken));
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online || !signedIn || pending === 0) return;
    let cancelled = false;
    const run = async () => {
      const { done } = await processOutbox();
      if (!cancelled && done > 0) toast.success(`${done} offline sale${done === 1 ? "" : "s"} synced`);
    };
    void run();
    const t = setInterval(run, RETRY_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [online, signedIn, pending]);

  useEffect(() => {
    if (!online) wasOffline.current = true;
    else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Back online");
    }
  }, [online]);

  if (online && pending === 0 && failed === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "flex items-center gap-2 px-4 py-2 text-xs font-medium print:hidden " +
        (failed > 0 ? "bg-bad-soft text-bad-ink" : "bg-warn-soft text-warn-ink")
      }
    >
      {online ? <CloudUpload className="size-4 shrink-0" aria-hidden /> : <CloudOff className="size-4 shrink-0" aria-hidden />}
      <span>
        {!online && "You're offline — changes to the point of sale are saved on this device. "}
        {pending > 0 && `${pending} sale${pending === 1 ? "" : "s"} waiting to sync. `}
        {failed > 0 && `${failed} sale${failed === 1 ? "" : "s"} need attention — open the POS sync queue.`}
      </span>
    </div>
  );
}

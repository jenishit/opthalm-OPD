"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { discardQueuedSale, processOutbox, retryFailedSale } from "@/lib/offline/outbox";
import { useOnline } from "@/lib/offline/use-online";
import { useOutbox } from "@/lib/offline/use-outbox";
import { formatCurrency } from "@/lib/utils";

export function SyncQueueDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const online = useOnline();
  const { items } = useOutbox();
  const [syncing, setSyncing] = useState(false);

  async function syncNow() {
    setSyncing(true);
    try {
      const { done, remaining } = await processOutbox();
      if (done) toast.success(`${done} sale(s) synced`);
      else if (remaining) toast.info("Nothing could be synced yet — check the connection or the errors below.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Sync queue</DialogTitle>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Everything is synced.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((q) => (
              <div key={q.id} className="flex items-center gap-3 rounded-md border border-line bg-app p-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <b className="text-sm text-foreground">{q.sale.patientName}</b>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(q.sale.total)} · {new Date(q.createdAt).toLocaleString()}
                    {q.progress.invoiceNo ? ` · invoice ${q.progress.invoiceNo} created` : ""}
                  </span>
                  {q.status === "failed" && <span role="alert" className="text-xs text-bad-ink">{q.lastError}</span>}
                  {q.status === "pending" && q.lastError && <span className="text-xs text-warn-ink">Retrying: {q.lastError}</span>}
                </div>
                <span className={q.status === "failed" ? "rounded bg-bad-soft px-2 py-0.5 text-[10px] font-semibold text-bad-ink" : "rounded bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn-ink"}>
                  {q.status === "failed" ? "Needs attention" : "Waiting"}
                </span>
                {q.status === "failed" && (
                  <Button size="sm" variant="secondary" onClick={() => retryFailedSale(q.id)}>
                    <RotateCcw className="size-3.5" /> Retry
                  </Button>
                )}
                <button
                  onClick={async () => {
                    const ok = await discardQueuedSale(q.id);
                    toast[ok ? "info" : "error"](ok ? "Queued sale discarded" : "An invoice already exists for this sale — resolve it in Billing instead of discarding.");
                  }}
                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Discard queued sale"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={syncNow} disabled={!online || syncing || items.length === 0}>
            {syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {online ? "Sync now" : "Offline"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { CloudUpload, FileClock, ReceiptText, Undo2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { useOutbox } from "@/lib/offline/use-outbox";
import { useOpenShift } from "@/lib/pos/use-shift";
import { usePosStore } from "./store";
import { OpenShiftDialog } from "./OpenShiftDialog";
import { CloseShiftDialog } from "./CloseShiftDialog";
import { SyncQueueDialog } from "./SyncQueueDialog";
import { HeldSalesDialog } from "./HeldSalesDialog";

/** POS header: shift status, sync queue, held sales, and links to refunds / shifts. */
export function PosHeaderActions() {
  const { shift, loading } = useOpenShift();
  const { pending, failed } = useOutbox();
  const heldCount = usePosStore((s) => s.heldSales.length);
  const [openDlg, setOpenDlg] = useState(false);
  const [closeDlg, setCloseDlg] = useState(false);
  const [queueDlg, setQueueDlg] = useState(false);
  const [heldDlg, setHeldDlg] = useState(false);
  const queued = pending + failed;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!loading &&
        (shift ? (
          <Button variant="secondary" onClick={() => setCloseDlg(true)} title="Close the shift and print the Z-report">
            <span className="size-2 rounded-full bg-ok" aria-hidden />
            Shift open since {new Date(shift.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Close
          </Button>
        ) : (
          <Button onClick={() => setOpenDlg(true)}>Open shift</Button>
        ))}
      {queued > 0 && (
        <Button variant="secondary" onClick={() => setQueueDlg(true)} className={failed > 0 ? "text-bad-ink" : undefined}>
          <CloudUpload />
          Sync queue ({queued})
        </Button>
      )}
      <Button variant="secondary" onClick={() => setHeldDlg(true)}>
        <FileClock />
        Held sales{heldCount > 0 ? ` (${heldCount})` : ""}
      </Button>
      <Button variant="secondary" asChild>
        <Link href="/pos/refunds"><Undo2 />Refunds</Link>
      </Button>
      <Button variant="secondary" asChild>
        <Link href="/pos/shifts"><ReceiptText />Shifts & Z-reports</Link>
      </Button>

      <OpenShiftDialog open={openDlg} onOpenChange={setOpenDlg} />
      {shift && <CloseShiftDialog shift={shift} open={closeDlg} onOpenChange={setCloseDlg} />}
      <SyncQueueDialog open={queueDlg} onOpenChange={setQueueDlg} />
      <HeldSalesDialog open={heldDlg} onOpenChange={setHeldDlg} />
    </div>
  );
}

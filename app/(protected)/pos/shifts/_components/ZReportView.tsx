"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsNotice } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { refundsForShift, salesForShift } from "@/lib/pos/ledger";
import { loadSellerInfo } from "@/lib/pos/seller";
import { getShift } from "@/lib/pos/shift";
import { computeZReport } from "@/lib/pos/zreport";
import { ZReportPaper } from "./ZReportPaper";

export function ZReportView({ id }: { id: string }) {
  const report = useAsync(async () => {
    const shift = await getShift(id);
    if (!shift) throw new Error("Shift not found on this device");
    if (shift.z) return { z: shift.z, interim: false };
    // Still open: build a live X-report from the ledger.
    const [sales, refunds] = await Promise.all([salesForShift(id), refundsForShift(id)]);
    return {
      interim: true,
      z: computeZReport({
        zNumber: 0, shiftId: id, openedAt: shift.openedAt, closedAt: new Date().toISOString(),
        openedBy: shift.openedBy, closedBy: shift.openedBy, openingFloat: shift.openingFloat,
        countedCash: 0, notes: "", sales, refunds,
      }),
    };
  });
  const seller = useAsync(loadSellerInfo);

  if (report.loading) return <OpsNotice kind="loading" text="Loading report…" />;
  if (report.error || !report.data) return <OpsNotice kind="error" text={report.error ?? "Report unavailable"} onRetry={report.reload} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link href="/pos/shifts"><ArrowLeft />All shifts</Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer />
          Print {report.data.interim ? "X-report" : "Z-report"}
        </Button>
      </div>
      <ZReportPaper z={report.data.z} interim={report.data.interim} clinicName={seller.data?.info?.name} />
    </div>
  );
}

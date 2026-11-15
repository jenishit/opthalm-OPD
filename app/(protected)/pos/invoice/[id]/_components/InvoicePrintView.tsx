"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { OpsNotice } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import { bumpPrintCount, getPrintCount } from "@/lib/pos/receipts";
import { loadSellerInfo } from "@/lib/pos/seller";
import { getInvoice } from "@/services/billing-services";
import { useAuthStore } from "@/stores/authStore";
import { InvoicePaper } from "./InvoicePaper";

export function InvoicePrintView({ id }: { id: string }) {
  const staffName = useAuthStore((s) => s.staffUser?.name ?? "Staff");
  const invoice = useAsync(() => getInvoice(id));
  const seller = useAsync(loadSellerInfo);
  const [copyNumber, setCopyNumber] = useState(0);
  const [buyerPan, setBuyerPan] = useState("");

  useEffect(() => {
    void getPrintCount(id).then(setCopyNumber);
  }, [id]);

  async function print() {
    window.print();
    setCopyNumber(await bumpPrintCount(id));
  }

  if (invoice.loading || seller.loading) return <OpsNotice kind="loading" text="Loading invoice…" />;
  if (invoice.error || !invoice.data) return <OpsNotice kind="error" text={invoice.error ?? "Invoice not found"} onRetry={invoice.reload} />;

  const info = seller.data?.info ?? null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link href="/pos"><ArrowLeft />Back to POS</Link>
        </Button>
        <Input
          aria-label="Buyer PAN (optional)"
          value={buyerPan}
          onChange={(e) => setBuyerPan(e.target.value)}
          placeholder="Buyer PAN (optional, for B2B)"
          className="h-9 w-64"
        />
        <Button onClick={print}>
          <Printer />
          {copyNumber === 0 ? "Print original" : `Print copy (${copyNumber})`}
        </Button>
      </div>

      {!info?.pan && (
        <div role="alert" className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink print:hidden">
          Seller PAN/VAT details aren&apos;t available on this device. The clinic settings are admin-only, so an admin must open
          any invoice on this terminal once (online) to save them here. Until then this invoice is not tax-compliant.
        </div>
      )}
      {seller.data?.fromCache && info && (
        <p className="text-xs text-muted-foreground print:hidden">Seller details loaded from this device&apos;s saved copy.</p>
      )}

      <InvoicePaper invoice={invoice.data} seller={info} copyNumber={copyNumber} buyerPan={buyerPan.trim()} printedBy={staffName} />
    </div>
  );
}

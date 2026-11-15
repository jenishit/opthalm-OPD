"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { Invoice } from "@/types/billing-types";
import { InvoiceSearch } from "./InvoiceSearch";
import { RefundPanel } from "./RefundPanel";

export function RefundWorkspace() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [version, setVersion] = useState(0);
  return (
    <div className="space-y-4">
      <Button variant="ghost" asChild>
        <Link href="/pos"><ArrowLeft />Back to POS</Link>
      </Button>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <InvoiceSearch key={version} selectedId={selected?.id ?? null} onSelect={setSelected} />
        {selected ? (
          <RefundPanel key={selected.id} invoiceId={selected.id} onRefunded={() => setVersion((v) => v + 1)} />
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed border-line p-10 text-sm text-muted-foreground">
            Select an invoice to review or refund it.
          </div>
        )}
      </div>
    </div>
  );
}

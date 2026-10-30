"use client";

import { useState } from "react";
import { FileClock } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { usePosStore } from "./_components/store";
import { ProductGrid } from "./_components/ProductGrid";
import { CartPanel } from "./_components/CartPanel";
import { HeldSalesDialog } from "./_components/HeldSalesDialog";

export default function PosPage() {
  const [heldOpen, setHeldOpen] = useState(false);
  const heldCount = usePosStore((s) => s.heldSales.length);

  return (
    <div className="flex h-full flex-col">
      <SectionHeading
        eyebrow="OPTICAL RETAIL"
        title="Point of sale"
        description="Fast, accurate checkout with barcode scanning and prescription-aware products."
        actions={
          <Button variant="secondary" onClick={() => setHeldOpen(true)}>
            <FileClock />
            Held sales{heldCount > 0 ? ` (${heldCount})` : ""}
          </Button>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ProductGrid />
        <CartPanel />
      </div>

      <HeldSalesDialog open={heldOpen} onOpenChange={setHeldOpen} />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { startPosPersistence } from "./_components/store";
import { ProductGrid } from "./_components/ProductGrid";
import { CartPanel } from "./_components/CartPanel";
import { PosHeaderActions } from "./_components/PosHeaderActions";

export default function PosPage() {
  useEffect(() => {
    void startPosPersistence();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <SectionHeading
        eyebrow="OPTICAL RETAIL"
        title="Point of sale"
        description="Fast, accurate checkout with barcode scanning. Works offline — sales sync when the connection returns."
        actions={<PosHeaderActions />}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ProductGrid />
        <CartPanel />
      </div>
    </div>
  );
}

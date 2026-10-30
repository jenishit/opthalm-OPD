"use client";

import { Glasses, Loader2, Plus, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/shadcn/input";
import { ScanBarcodeDialog } from "@/components/ui/ScanBarcodeDialog";
import { useInventoryItems } from "@/lib/hooks/use-inventory-items";
import { cn, formatCurrency } from "@/lib/utils";
import { CATEGORY_LABEL, CATEGORY_TABS } from "@/lib/inventory-category";
import type { InventoryCategory, InventoryItemDTO } from "@/types/api-types";
import { usePosStore } from "./store";

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "all">("all");
  const [scanOpen, setScanOpen] = useState(false);

  const { items, loading, usingMock } = useInventoryItems(search);
  const addItem = usePosStore((s) => s.addItem);
  const cart = usePosStore((s) => s.cart);

  const filtered = category === "all" ? items : items.filter((i) => i.category === category);

  function handleAdd(item: InventoryItemDTO) {
    const line = cart.find((l) => l.item.id === item.id);
    const cap = item.quantity_on_hand > 0 ? item.quantity_on_hand : 0;
    if (!item.is_active || cap <= 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }
    if (line && line.qty >= cap) {
      toast.error(`Only ${cap} ${item.unit ?? "unit"}(s) of ${item.name} left`);
      return;
    }
    addItem(item);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-3.5 shadow-sm sm:flex-row">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1"
        />
        <button
          onClick={() => setScanOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-app px-3.5 py-2 text-sm font-semibold text-sage hover:border-sage"
        >
          <ScanBarcode className="size-4" />
          Scan barcode
          <kbd className="ml-1 rounded border border-line/70 bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
            F3
          </kbd>
        </button>
      </div>

      <div className="inline-flex flex-wrap gap-0.5 self-start rounded-lg bg-muted/60 p-0.5">
        {(["all", ...CATEGORY_TABS] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              category === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {c === "all" ? "All" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {usingMock && (
        <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Showing sample products — no inventory has been added yet.
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((item) => {
              const outOfStock = !item.is_active || item.quantity_on_hand <= 0;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAdd(item)}
                  disabled={outOfStock}
                  className="group flex flex-col overflow-hidden rounded-lg border border-line bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span className="relative grid h-28 place-items-center bg-sage-soft text-sage">
                    <Glasses size={44} />
                    {!outOfStock && (
                      <span className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-md border border-line bg-card text-sage opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus size={15} />
                      </span>
                    )}
                    {outOfStock && (
                      <span className="pill pill-bad absolute top-2 right-2">Out of stock</span>
                    )}
                  </span>
                  <span className="flex flex-col gap-0.5 p-2.5">
                    <b className="text-xs text-foreground">{item.brand ?? CATEGORY_LABEL[item.category as InventoryCategory]}</b>
                    <small className="min-h-[2.2em] text-[11px] text-muted-foreground">{item.name}</small>
                    <strong className="font-display text-sm text-foreground">{formatCurrency(item.selling_price)}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        Prices reflect current stock. Prescription lenses can be attached to an active patient order.
      </p>

      <ScanBarcodeDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onFound={(item) => handleAdd(item)}
      />
    </div>
  );
}

"use client";

import { usePagination } from "@/lib/hooks/use-pagination";
import { Pager } from "@/components/ui/Pager";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Box,
  Package,
  Plus,
  ScanBarcode,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import StatCard from "@/components/ui/StatCard";
import { ScanBarcodeDialog } from "@/components/ui/ScanBarcodeDialog";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { useInventoryItems } from "@/lib/hooks/use-inventory-items";
import { formatCurrency } from "@/lib/utils";
import type { InventoryCategory, InventoryItem } from "@/types/inventory-types";
import {
  InventoryTable,
  type InventoryView,
} from "./_components/InventoryTable";
import { AddProductDialog } from "./_components/AddProductDialog";
import { AddStockDialog } from "./_components/AddStockDialog";
import { ExpiryTracker } from "./_components/ExpiryTracker";
import { EXPIRY_WINDOW_DAYS, buildExpiryEntries, nextExpiryByItem } from "./_components/expiry-data";
import { useAsync } from "@/lib/hooks/use-async";
import { getExpiringLots } from "@/services/inventory-services";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "all">("all");
  const [view, setView] = useState<InventoryView>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);

  const { items, loading, error, refresh: refreshItems, truncated } = useInventoryItems(search);
  // One lot query feeds both the per-product Expiry column and the tracker below.
  const lots = useAsync(() => getExpiringLots(EXPIRY_WINDOW_DAYS));
  const entries = useMemo(() => buildExpiryEntries(lots.data ?? [], items), [lots.data, items]);
  const expiry = useMemo(() => nextExpiryByItem(entries, items), [entries, items]);
  const refresh = () => {
    refreshItems();
    lots.reload();
  };
  const filtered =
    category === "all" ? items : items.filter((i) => i.category === category);

  const pg = usePagination(filtered, `${category}|${search}`, 25);

  const activeCount = items.filter((i) => i.is_active).length;
  const inventoryValue = items.reduce(
    (sum, i) => sum + i.selling_price * i.quantity_on_hand,
    0,
  );
  const lowStockCount = items.filter(
    (i) => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_threshold,
  ).length;
  const outOfStockCount = items.filter((i) => i.quantity_on_hand <= 0).length;

  return (
    <>
      <SectionHeading
        eyebrow="OPTICAL RETAIL"
        title="Inventory"
        description="A considered view of every frame, lens, and accessory in your store."
        actions={
          <>
            <Button variant="secondary" onClick={() => setScanOpen(true)}>
              <ScanBarcode />
              Scan barcode
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus />
              Add product
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard
          label="Active products"
          value={String(activeCount).padStart(2, "0")}
          change={`${items.length} SKUs`}
          foot="across all categories"
          icon={Package}
        />
        <StatCard
          label="Inventory value"
          value={formatCurrency(inventoryValue)}
          change="At selling price"
          foot="current stock value"
          icon={Wallet}
          kind="blue"
        />
        <StatCard
          label="Low stock"
          value={String(lowStockCount).padStart(2, "0")}
          change="Reorder soon"
          foot="below threshold"
          icon={AlertCircle}
          kind="amber"
        />
        <StatCard
          label="Out of stock"
          value={String(outOfStockCount).padStart(2, "0")}
          change="Needs action"
          foot="unavailable to sell"
          icon={Box}
          kind="violet"
        />
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>Couldn&apos;t load inventory. Figures below may be incomplete.</span>
          <button type="button" onClick={refresh} className="font-semibold underline">Retry</button>
        </div>
      )}

      {truncated && (
        <div role="status" className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">
          Only the first 5,000 products are loaded. Use search to find the rest.
        </div>
      )}

      <InventoryTable
        pager={<Pager page={pg.page} pageCount={pg.pageCount} pageSize={pg.pageSize} total={pg.total} onPage={pg.setPage} onPageSize={pg.setPageSize} noun="products" />}
        items={pg.pageItems}
        loading={loading}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        onAddStock={setStockItem}
        expiry={expiry}
        view={view}
        onViewChange={setView}
      />

      <div className="mt-4">
        <ExpiryTracker entries={entries} loading={lots.loading} error={lots.error} onRetry={lots.reload} />
      </div>

      <AddProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={refresh}
      />
      <AddStockDialog
        item={stockItem}
        onOpenChange={(open) => !open && setStockItem(null)}
        onUpdated={refresh}
      />
      <ScanBarcodeDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onFound={(item) => {
          setCategory("all");
          setSearch(item.sku);
          toast.success(`Found ${item.name}`);
        }}
      />
    </>
  );
}

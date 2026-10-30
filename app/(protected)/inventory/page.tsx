"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Box, Package, Plus, ScanBarcode, Wallet } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import StatCard from "@/components/ui/StatCard";
import { ScanBarcodeDialog } from "@/components/ui/ScanBarcodeDialog";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { useInventoryItems } from "@/lib/hooks/use-inventory-items";
import { formatCurrency } from "@/lib/utils";
import type { InventoryCategory, InventoryItemDTO } from "@/types/api-types";
import { InventoryTable } from "./_components/InventoryTable";
import { AddProductDialog } from "./_components/AddProductDialog";
import { AddStockDialog } from "./_components/AddStockDialog";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [stockItem, setStockItem] = useState<InventoryItemDTO | null>(null);

  const { items, loading, usingMock, refresh } = useInventoryItems(search);
  const filtered = category === "all" ? items : items.filter((i) => i.category === category);

  const activeCount = items.filter((i) => i.is_active).length;
  const inventoryValue = items.reduce((sum, i) => sum + i.selling_price * i.quantity_on_hand, 0);
  const lowStockCount = items.filter((i) => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_threshold).length;
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

      <InventoryTable
        items={filtered}
        loading={loading}
        usingMock={usingMock}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        onAddStock={setStockItem}
      />

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refresh} />
      <AddStockDialog item={stockItem} onOpenChange={(open) => !open && setStockItem(null)} onUpdated={refresh} />
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

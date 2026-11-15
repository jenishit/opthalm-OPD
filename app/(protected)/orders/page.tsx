"use client";

import { useMemo, useState } from "react";
import { Plus, Truck, Receipt, Wallet, Building2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsStat } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import { useAsync } from "@/lib/hooks/use-async";
import { listLowStock, listPurchases } from "@/services/inventory-services";
import { fetchAll } from "@/lib/pagination";
import { PurchasesTable } from "./_components/PurchasesTable";
import { SupplierLowerGrid } from "./_components/SupplierLowerGrid";
import { RecordPurchaseDialog } from "./_components/RecordPurchaseDialog";

export default function SupplierPurchasesPage() {
  const purchases = useAsync(async () => (await fetchAll(listPurchases)).items);
  const lowStock = useAsync(listLowStock);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => purchases.data ?? [], [purchases.data]);
  const stats = useMemo(() => {
    const now = new Date();
    let month = 0;
    let due = 0;
    const dueVendors = new Set<string>();
    for (const p of list) {
      const d = new Date(p.purchase_date);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) month += p.total_amount;
      if (p.due_amount > 0) {
        due += p.due_amount;
        dueVendors.add(p.vendor_id);
      }
    }
    return { month, due, dueVendors: dueVendors.size };
  }, [list]);
  const l = purchases.loading;

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PURCHASING & VENDORS</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
            Supplier purchases
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Stock received from vendors, what you paid and what is still due. Recording a purchase adds the stock.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-9 gap-2 rounded-[7px] border border-sage bg-sage px-3.5 text-[11px] font-semibold text-primary-foreground hover:border-sagehover hover:bg-sagehover"
        >
          <Plus size={14} />
          Record purchase
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat label="Purchases" value={l ? "…" : String(list.length)} foot="recorded" icon={Truck} bg="bg-sage-soft" text="text-sage" />
        <OpsStat label="This month" value={l ? "…" : formatCurrency(stats.month)} foot="purchased" icon={Receipt} bg="bg-t-new-soft" text="text-t-new" />
        <OpsStat label="Outstanding dues" value={l ? "…" : formatCurrency(stats.due)} foot="owed to vendors" icon={Wallet} bg="bg-warn-soft" text="text-warn-ink" />
        <OpsStat label="Vendors owed" value={l ? "…" : String(stats.dueVendors)} foot="with an unpaid balance" icon={Building2} bg="bg-t-surg-soft" text="text-t-surg" />
      </div>

      <PurchasesTable purchases={list} loading={l} error={purchases.error} onRetry={purchases.reload} />
      <SupplierLowerGrid purchases={list} lowStockCount={lowStock.data?.length ?? null} />
      <RecordPurchaseDialog open={open} onOpenChange={setOpen} onCreated={() => { purchases.reload(); lowStock.reload(); }} />
    </div>
  );
}

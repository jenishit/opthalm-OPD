"use client";

import { useMemo, useState } from "react";
import { Plus, ShoppingBag, Wrench, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { OpsStat } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import { useAsync } from "@/lib/hooks/use-async";
import { listLabJobs } from "@/services/lab-services";
import { fetchAll } from "@/lib/pagination";
import { OrdersTable } from "./_components/OrdersTable";
import { FulfilmentOverview } from "./_components/FulfilmentOverview";
import { NewOrderDialog } from "./_components/NewOrderDialog";
import type { StatusTab } from "./_components/status";

export default function CustomerOrdersPage() {
  const { data, loading, error, reload } = useAsync(async () => (await fetchAll(listLabJobs)).items);
  const jobs = useMemo(() => data ?? [], [data]);
  const [tab, setTab] = useState<StatusTab>("active");
  const [newOpen, setNewOpen] = useState(false);

  const open = jobs.filter((j) => j.status !== "delivered" && j.status !== "cancelled");
  const fitting = jobs.filter((j) => j.status === "in_fitting").length;
  const ready = jobs.filter((j) => j.status === "ready_to_deliver").length;
  const advance = open.reduce((s, j) => s + j.advance_payment, 0);
  const v = (n: number | string) => (loading ? "…" : String(n));

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">FULFILMENT & COLLECTION</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">
            Customer orders
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Track every lab job from fitting to collection.
          </p>
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          className="min-h-9 gap-2 rounded-[7px] border border-sage bg-sage px-3.5 text-[11px] font-semibold text-primary-foreground hover:border-sagehover hover:bg-sagehover"
        >
          <Plus size={14} />
          New order
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat label="Open orders" value={v(open.length)} foot="not yet delivered" icon={ShoppingBag} bg="bg-sage-soft" text="text-sage" />
        <OpsStat label="In fitting" value={v(fitting)} foot="being made or fitted" icon={Wrench} bg="bg-t-new-soft" text="text-t-new" />
        <OpsStat label="Ready to deliver" value={v(ready)} foot="awaiting collection" icon={CheckCircle2} bg="bg-warn-soft" text="text-warn-ink" />
        <OpsStat label="Advance collected" value={loading ? "…" : formatCurrency(advance)} foot="on open orders" icon={Wallet} bg="bg-t-surg-soft" text="text-t-surg" />
      </div>

      <OrdersTable jobs={jobs} loading={loading} error={error} onRetry={reload} onChanged={reload} tab={tab} onTabChange={setTab} />
      <FulfilmentOverview jobs={jobs} onSelect={setTab} />
      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} onCreated={reload} />
    </div>
  );
}

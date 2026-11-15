import Link from "next/link";
import { ArrowRight, ClipboardList, Wallet } from "lucide-react";
import { opsCard } from "@/components/ui/OpsStat";
import { formatCurrency } from "@/lib/utils";
import type { Purchase } from "@/types/inventory-types";

export function SupplierLowerGrid({ purchases, lowStockCount }: { purchases: Purchase[]; lowStockCount: number | null }) {
  const byVendor = new Map<string, { name: string; due: number; bills: number }>();
  for (const p of purchases) {
    if (p.due_amount <= 0) continue;
    const v = byVendor.get(p.vendor_id) ?? { name: p.vendor_name, due: 0, bills: 0 };
    v.due += p.due_amount;
    v.bills += 1;
    byVendor.set(p.vendor_id, v);
  }
  const owed = [...byVendor.values()].sort((a, b) => b.due - a.due);

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className={opsCard}>
        <div className="flex items-center justify-between gap-3 px-5 pb-[14px] pt-[19px]">
          <div>
            <h3 className="m-0 font-display text-base font-semibold text-ink">Vendor dues</h3>
            <p className="m-0 mt-[5px] text-[10px] text-mute">Unpaid balances by vendor</p>
          </div>
          <Wallet size={17} className="text-mute" aria-hidden />
        </div>
        {owed.length === 0 ? (
          <div className="px-5 pb-6 text-[11px] text-mute">No outstanding vendor balances.</div>
        ) : (
          owed.map((v, i) => (
            <div key={v.name} className={"flex items-center gap-3 px-5 py-3 " + (i > 0 ? "border-t border-line" : "")}>
              <div className="flex flex-1 flex-col gap-[5px]">
                <b className="text-[11px] text-ink">{v.name}</b>
                <span className="text-[9px] text-mute">{v.bills} unpaid {v.bills === 1 ? "bill" : "bills"}</span>
              </div>
              <b className="text-[11px] text-bad-ink">{formatCurrency(v.due)}</b>
            </div>
          ))
        )}
      </div>

      <div className={`p-5 ${opsCard}`}>
        <span className="grid size-[34px] place-items-center rounded-[9px] bg-sage-soft text-sage">
          <ClipboardList size={18} aria-hidden />
        </span>
        <h3 className="mb-[7px] mt-[14px] font-display text-base font-semibold text-ink">Reorder watch</h3>
        <p className="mb-[17px] text-[10px] leading-[1.7] text-mute">
          {lowStockCount === null
            ? "Checking stock levels…"
            : lowStockCount === 0
              ? "Every product is above its reorder point."
              : `${lowStockCount} product ${lowStockCount === 1 ? "line is" : "lines are"} at or below the reorder point. Record a purchase once the stock arrives.`}
        </p>
        <Link
          href="/inventory"
          className="inline-flex min-h-9 items-center gap-2 rounded-[7px] border border-line bg-card px-3.5 text-[11px] font-semibold text-ink hover:border-strong hover:bg-app"
        >
          Open inventory <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSalesByCategory } from "@/services/reports-services";
import { CATEGORY_LABEL } from "@/lib/inventory-category";
import { formatCurrency } from "@/lib/utils";
import type { InventoryCategory } from "@/types/inventory-types";
import type { SalesByCategory } from "@/types/reports-types";

const CHART_COLORS = [
  "var(--c-chart-1)",
  "var(--c-chart-2)",
  "var(--c-chart-3)",
  "var(--c-chart-4)",
  "var(--c-chart-5)",
  "var(--c-chart-6)",
];

export function RevenueBreakdown({ from, to }: { from: string; to: string }) {
  const [rows, setRows] = useState<SalesByCategory[] | null>(null);

  useEffect(() => {
    let active = true;
    getSalesByCategory(from, to)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((error) => {
        console.error("Failed to load sales by category", error);
      });
    return () => {
      active = false;
    };
  }, [from, to]);

  const sorted = rows ? [...rows].sort((a, b) => b.total_sales - a.total_sales) : [];
  const total = sorted.reduce((sum, r) => sum + r.total_sales, 0);

  return (
    <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] pb-4 shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="px-5 pb-[14px] pt-[19px]">
        <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Revenue by category</h3>
        <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Share of optical sales — excludes service-only line items</p>
      </div>
      {rows === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-[#92988c]">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </div>
      ) : sorted.length === 0 ? (
        <div className="px-5 py-6 text-center text-[11px] text-[#92988c]">No optical sales in this period.</div>
      ) : (
        sorted.map((row, i) => (
          <div key={row.category} className="px-5 pb-[5px] pt-3">
            <div className="mb-[9px] flex items-center justify-between">
              <span className="text-[10px] text-[#7f887c]">
                {CATEGORY_LABEL[row.category as InventoryCategory] ?? row.category}
              </span>
              <b className="text-[11px] text-[#23342c]">{formatCurrency(row.total_sales)}</b>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[5px] bg-[#eeece4]">
              <span
                className="block h-full rounded-[5px]"
                style={{
                  width: `${total > 0 ? (row.total_sales / total) * 100 : 0}%`,
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

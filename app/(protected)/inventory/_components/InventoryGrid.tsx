"use client";

import { CalendarClock, Loader2, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  STOCK_STATUS_LABEL,
  STOCK_STATUS_PILL,
  daysUntilExpiry,
  expiryLabel,
  expiryTone,
  stockStatus,
} from "@/lib/inventory-category";
import type { InventoryCategory, InventoryItem } from "@/types/inventory-types";

const EXPIRY_PILL: Record<"bad" | "warn" | "mute", string> = {
  bad: "pill-bad",
  warn: "pill-warn",
  mute: "pill-mute",
};

/** Target the stock bar fills against — items without a meaningful threshold just show relative fullness. */
function barTarget(item: InventoryItem) {
  return Math.max(item.reorder_threshold * 3, item.quantity_on_hand, 1);
}

function barTone(status: ReturnType<typeof stockStatus>) {
  return status === "ok" ? "bg-ok" : status === "low" ? "bg-warn" : "bg-bad";
}

export function InventoryGrid({
  items,
  loading,
  search,
  onAddStock,
  onSetExpiry,
}: {
  items: InventoryItem[];
  loading: boolean;
  search: string;
  onAddStock: (item: InventoryItem) => void;
  onSetExpiry: (item: InventoryItem) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-card py-16 text-center text-sm text-muted-foreground shadow-sm">
        <Loader2 className="mr-2 inline size-4 animate-spin" />
        Loading inventory…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card py-16 text-center text-sm text-muted-foreground shadow-sm">
        No products found{search && ` for "${search}"`}.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => {
        const status = stockStatus(item);
        const Icon =
          CATEGORY_ICON[item.category as InventoryCategory] ??
          CATEGORY_ICON.other;
        const days = daysUntilExpiry(item);
        const tone = expiryTone(days);
        const ratio = Math.min(
          100,
          Math.max(2, (item.quantity_on_hand / barTarget(item)) * 100),
        );

        return (
          <div
            key={item.id}
            className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-card p-3.5 shadow-sm hover:border-sage"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-sage-soft text-sage">
                <Icon size={18} />
              </span>
              <span className="pill pill-mute">
                {CATEGORY_LABEL[item.category as InventoryCategory] ??
                  item.category}
              </span>
            </div>

            <div className="min-h-[2.4em]">
              <div className="truncate text-sm font-semibold text-foreground">
                {item.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {item.brand ?? "—"}
                {item.model ? ` · ${item.model}` : ""}
              </div>
            </div>

            <div>
              <div className="h-2 overflow-hidden rounded-full border border-line bg-app">
                <div
                  className={cn("h-full", barTone(status))}
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-xs">
                <span className="font-semibold text-foreground">
                  {item.quantity_on_hand}{" "}
                  <span className="font-sans font-normal text-muted-foreground">
                    {item.unit ?? "units"}
                  </span>
                </span>
                <span className="text-muted-foreground">{item.sku}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className={cn("pill", STOCK_STATUS_PILL[status])}>
                {STOCK_STATUS_LABEL[status]}
              </span>
              {days != null && tone && (
                <span className={cn("pill", EXPIRY_PILL[tone])}>
                  <CalendarClock size={11} />
                  {expiryLabel(days)}
                </span>
              )}
            </div>

            <div className="mt-auto flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onAddStock(item)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line px-2 py-1.5 text-xs font-semibold text-foreground hover:border-sage hover:bg-muted/40"
              >
                <PackagePlus size={14} />
                Add stock
              </button>
              <button
                type="button"
                aria-label="Set expiry date"
                title="Set expiry date"
                onClick={() => onSetExpiry(item)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
              >
                <CalendarClock size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

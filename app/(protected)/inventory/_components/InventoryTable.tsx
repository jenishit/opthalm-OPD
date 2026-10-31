"use client";

import { Glasses, LayoutGrid, List, Loader2, MoreHorizontal, PackagePlus, SlidersHorizontal, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  CATEGORY_TABS,
  STOCK_STATUS_LABEL,
  STOCK_STATUS_PILL,
  daysUntilExpiry,
  expiryLabel,
  expiryTone,
  stockStatus,
} from "@/lib/inventory-category";
import type { InventoryCategory, InventoryItemDTO } from "@/types/api-types";
import { InventoryGrid } from "./InventoryGrid";

const EXPIRY_PILL: Record<"bad" | "warn" | "mute", string> = {
  bad: "pill-bad",
  warn: "pill-warn",
  mute: "pill-mute",
};

export type InventoryView = "list" | "grid";

export function InventoryTable({
  items,
  loading,
  usingMock,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  onAddStock,
  onSetExpiry,
  view,
  onViewChange,
}: {
  items: InventoryItemDTO[];
  loading: boolean;
  usingMock: boolean;
  category: InventoryCategory | "all";
  onCategoryChange: (category: InventoryCategory | "all") => void;
  search: string;
  onSearchChange: (search: string) => void;
  onAddStock: (item: InventoryItemDTO) => void;
  onSetExpiry: (item: InventoryItemDTO) => void;
  view: InventoryView;
  onViewChange: (view: InventoryView) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-4 py-3.5">
        <div className="inline-flex flex-wrap gap-0.5 rounded-lg bg-muted/60 p-0.5">
          {(["all", ...CATEGORY_TABS] as const).map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                category === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c === "all" ? "All products" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU, brand, product…"
            className="w-56"
          />
          <button
            onClick={() => toast.info("Inventory filters are coming soon")}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm font-semibold text-foreground hover:border-sage"
          >
            <SlidersHorizontal className="size-4" />
            Filter
          </button>
          <div className="inline-flex gap-0.5 rounded-md border border-line bg-muted/40 p-0.5">
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => onViewChange("list")}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-[5px]",
                view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => onViewChange("grid")}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-[5px]",
                view === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {usingMock && (
        <div className="mx-4 mt-3 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Showing sample products — no inventory has been added yet.
        </div>
      )}

      {view === "grid" ? (
        <div className="p-4">
          <InventoryGrid items={items} loading={loading} search={search} onAddStock={onAddStock} onSetExpiry={onSetExpiry} />
        </div>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU / barcode</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Unit price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline size-4 animate-spin" />
                Loading inventory…
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                No products found{search && ` for "${search}"`}.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const status = stockStatus(item);
              const days = daysUntilExpiry(item);
              const tone = expiryTone(days);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-sage-soft text-sage">
                        <Glasses size={18} />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.brand ?? "—"}
                          {item.model ? ` · ${item.model}` : ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {CATEGORY_LABEL[item.category as InventoryCategory] ?? item.category}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">{item.quantity_on_hand}</span>{" "}
                    <span className="text-xs text-muted-foreground">{item.unit ?? "units"}</span>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatCurrency(item.selling_price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <span className={cn("pill", STOCK_STATUS_PILL[status])}>{STOCK_STATUS_LABEL[status]}</span>
                      {days != null && tone && (
                        <span className={cn("pill", EXPIRY_PILL[tone])}>
                          <CalendarClock size={11} />
                          {expiryLabel(days)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAddStock(item)}>
                          <PackagePlus className="size-4" />
                          Add stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetExpiry(item)}>
                          <CalendarClock className="size-4" />
                          Set expiry date
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      )}

      {items.length > 0 && (
        <div className="flex items-center justify-between border-t border-line/70 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Showing {items.length} {items.length === 1 ? "product" : "products"}
          </span>
        </div>
      )}
    </div>
  );
}

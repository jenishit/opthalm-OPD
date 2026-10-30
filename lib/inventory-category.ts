import type { InventoryCategory, InventoryItemDTO, InvoiceItemType } from "@/types/api-types";

export const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  frame: "Frames",
  lens: "Lenses",
  contact_lens: "Contact lenses",
  sunglasses: "Sunglasses",
  coating: "Coatings",
  accessory: "Accessories",
  other: "Other",
};

/** Categories shown as filter tabs — "coating" and "other" stay reachable via search/All. */
export const CATEGORY_TABS: InventoryCategory[] = [
  "frame",
  "lens",
  "contact_lens",
  "sunglasses",
  "accessory",
];

export type StockStatus = "out" | "low" | "ok";

export function stockStatus(item: InventoryItemDTO): StockStatus {
  if (item.quantity_on_hand <= 0) return "out";
  if (item.quantity_on_hand <= item.reorder_threshold) return "low";
  return "ok";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  out: "Out of stock",
  low: "Low stock",
  ok: "In stock",
};

export const STOCK_STATUS_PILL: Record<StockStatus, string> = {
  out: "pill-bad",
  low: "pill-warn",
  ok: "pill-ok",
};

/** Billing only distinguishes frame/lens/coating/contact_lens/service — everything else bills as "other". */
export const CATEGORY_TO_INVOICE_ITEM_TYPE: Record<InventoryCategory, InvoiceItemType> = {
  frame: "frame",
  lens: "lens",
  coating: "coating",
  contact_lens: "contact_lens",
  sunglasses: "other",
  accessory: "other",
  other: "other",
};

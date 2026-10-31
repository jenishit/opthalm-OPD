import { Box, Droplet, Eye, Glasses, Layers, Package } from "lucide-react";
import type { ElementType } from "react";
import { today0 } from "@/lib/utils";
import type { InventoryCategory, InventoryItem } from "@/types/inventory-types";
import type { InvoiceItemType } from "@/types/billing-types";

/** Icon shown for each category in the inventory grid view and expiry tracker. */
export const CATEGORY_ICON: Record<InventoryCategory, ElementType> = {
  frame: Glasses,
  lens: Eye,
  contact_lens: Droplet,
  sunglasses: Glasses,
  coating: Layers,
  accessory: Package,
  other: Box,
};

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

export function stockStatus(item: InventoryItem): StockStatus {
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

export type ExpiryTone = "bad" | "warn" | "mute";

/** Days from today until the item's current stock expires; negative once past due. Null when it has no shelf life. */
export function daysUntilExpiry(item: Pick<InventoryItem, "expiry_date">): number | null {
  if (!item.expiry_date) return null;
  const expiry = new Date(`${item.expiry_date}T00:00:00`);
  return Math.round((expiry.getTime() - today0().getTime()) / 86_400_000);
}

/** Pill tone for an expiry countdown — null once it's far enough out (> 90 days) to not need flagging. */
export function expiryTone(days: number | null): ExpiryTone | null {
  if (days == null) return null;
  if (days <= 30) return "bad";
  if (days <= 60) return "warn";
  if (days <= 90) return "mute";
  return null;
}

export function expiryLabel(days: number): string {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `Exp. ${days}d`;
}

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

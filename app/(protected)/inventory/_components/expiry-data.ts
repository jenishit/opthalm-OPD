import { daysUntilExpiry } from "@/lib/inventory-category";
import type { ExpiringLot, InventoryItem } from "@/types/inventory-types";

export const EXPIRY_WINDOW_DAYS = 90;

export type ExpiryBucket = "expired" | "d30" | "d60" | "d90";

export interface ExpiryEntry {
  key: string;
  itemId: string;
  name: string;
  sku: string;
  /** Present when the entry comes from a stock lot. */
  lotNo?: string;
  quantity?: number;
  /** ISO date (YYYY-MM-DD). */
  expiry: string;
  /** Whole days from today; negative once expired. */
  days: number;
  category?: string;
}

export const BUCKET_ORDER: ExpiryBucket[] = ["expired", "d30", "d60", "d90"];

export const BUCKET_META: Record<ExpiryBucket, { label: string; short: string; tile: string; cell: string; pill: string }> = {
  expired: { label: "Expired", short: "Expired", tile: "border-bad bg-bad-soft text-bad-ink", cell: "bg-bad border-bad text-onacc", pill: "pill-bad" },
  d30: { label: "Within 30 days", short: "≤ 30 d", tile: "border-bad/50 bg-bad-soft/60 text-bad-ink", cell: "bg-bad-soft border-bad text-bad-ink", pill: "pill-bad" },
  d60: { label: "31 – 60 days", short: "31–60 d", tile: "border-warn/60 bg-warn-soft text-warn-ink", cell: "bg-warn-soft border-warn text-warn-ink", pill: "pill-warn" },
  d90: { label: "61 – 90 days", short: "61–90 d", tile: "border-sage/50 bg-sage-soft text-sage", cell: "bg-sage-soft border-sage text-sage", pill: "pill-mute" },
};

export function bucketOf(days: number): ExpiryBucket {
  return days < 0 ? "expired" : days <= 30 ? "d30" : days <= 60 ? "d60" : "d90";
}

/**
 * Real lot-level expiries from the backend, plus any item that only has the
 * legacy single `expiry_date` (and no lot rows) so nothing is silently missed.
 */
export function buildExpiryEntries(lots: ExpiringLot[], items: InventoryItem[]): ExpiryEntry[] {
  const fromLots: ExpiryEntry[] = lots.map((l) => ({
    key: `${l.inventory_item_id}:${l.lot_no}:${l.expiry_date}`,
    itemId: l.inventory_item_id,
    name: l.item_name,
    sku: l.sku,
    lotNo: l.lot_no,
    quantity: l.quantity,
    expiry: l.expiry_date.slice(0, 10),
    days: l.days_to_expiry,
    category: items.find((i) => i.id === l.inventory_item_id)?.category,
  }));
  const covered = new Set(lots.map((l) => l.inventory_item_id));
  const legacy: ExpiryEntry[] = [];
  for (const item of items) {
    if (covered.has(item.id) || !item.expiry_date) continue;
    const days = daysUntilExpiry(item);
    if (days == null || days > EXPIRY_WINDOW_DAYS) continue;
    legacy.push({
      key: `${item.id}:item`,
      itemId: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity_on_hand,
      expiry: item.expiry_date.slice(0, 10),
      days,
      category: item.category,
    });
  }
  return [...fromLots, ...legacy].filter((e) => e.days <= EXPIRY_WINDOW_DAYS).sort((a, b) => a.days - b.days);
}

/** The soonest-expiring lot of each item, for showing an Expiry column. */
export function nextExpiryByItem(entries: ExpiryEntry[], items: InventoryItem[] = []): Map<string, ExpiryEntry> {
  const m = new Map<string, ExpiryEntry>();
  for (const e of entries) {
    const cur = m.get(e.itemId);
    if (!cur || e.days < cur.days) m.set(e.itemId, e);
  }
  // Items whose nearest batch is beyond the tracker window still carry the server's next_expiry_date.
  for (const item of items) {
    if (m.has(item.id) || !item.next_expiry_date) continue;
    const day = item.next_expiry_date.slice(0, 10);
    m.set(item.id, {
      key: `${item.id}:next`,
      itemId: item.id,
      name: item.name,
      sku: item.sku,
      expiry: day,
      days: daysUntilExpiry({ expiry_date: day }) ?? 0,
      category: item.category,
    });
  }
  return m;
}

export function countByBucket(entries: ExpiryEntry[]): Record<ExpiryBucket, number> {
  const c: Record<ExpiryBucket, number> = { expired: 0, d30: 0, d60: 0, d90: 0 };
  for (const e of entries) c[bucketOf(e.days)]++;
  return c;
}

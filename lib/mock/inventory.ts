import type { InventoryItemDTO } from "@/types/api-types";

const now = new Date().toISOString();

/**
 * Sample catalog shown only when the real inventory (from listInventoryItems)
 * comes back empty — there's no stock seeded in a fresh clinic yet. Flagged
 * in the UI as sample data so staff never mistake these for real stock.
 */
/** Ships the mock catalog with an expiry a fixed number of days from "today", at UTC midnight. */
function inDays(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const MOCK_INVENTORY: InventoryItemDTO[] = [
  {
    id: "mock-inv-1", category: "frame", sku: "FRM-RB-2140", name: "Wayfarer Classic",
    brand: "Ray-Ban", model: "RB2140", color: "Tortoise", size: "54mm", unit: "pc",
    cost_price: 6500, selling_price: 12500, quantity_on_hand: 14, reorder_threshold: 5,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-2", category: "frame", sku: "FRM-OK-8081", name: "Round Titanium",
    brand: "Oakley", model: "OK8081", color: "Gunmetal", size: "52mm", unit: "pc",
    cost_price: 8200, selling_price: 15800, quantity_on_hand: 3, reorder_threshold: 5,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-3", category: "lens", sku: "LNS-ESS-SV", name: "Essilor Single Vision",
    brand: "Essilor", model: null, color: null, size: null, unit: "pair",
    cost_price: 1800, selling_price: 3800, quantity_on_hand: 42, reorder_threshold: 10,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-4", category: "lens", sku: "LNS-ZEI-PRG", name: "Zeiss Progressive",
    brand: "Zeiss", model: null, color: null, size: null, unit: "pair",
    cost_price: 6200, selling_price: 11500, quantity_on_hand: 0, reorder_threshold: 4,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-5", category: "contact_lens", sku: "CTL-ACU-OASYS", name: "Acuvue Oasys (6-pack)",
    brand: "Johnson & Johnson", model: null, color: null, size: "-2.00", unit: "box",
    cost_price: 1400, selling_price: 2600, quantity_on_hand: 26, reorder_threshold: 8,
    expiry_date: inDays(20), is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-6", category: "sunglasses", sku: "SUN-RB-3025", name: "Aviator Classic",
    brand: "Ray-Ban", model: "RB3025", color: "Gold / Green", size: "58mm", unit: "pc",
    cost_price: 7200, selling_price: 14200, quantity_on_hand: 9, reorder_threshold: 4,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-7", category: "accessory", sku: "ACC-CASE-01", name: "Hard Shell Case",
    brand: "Generic", model: null, color: "Black", size: null, unit: "pc",
    cost_price: 250, selling_price: 650, quantity_on_hand: 60, reorder_threshold: 15,
    expiry_date: null, is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-8", category: "coating", sku: "CTG-AR-PREM", name: "Premium Anti-Reflective Coating",
    brand: "Essilor", model: null, color: null, size: null, unit: "pair",
    cost_price: 900, selling_price: 2200, quantity_on_hand: 2, reorder_threshold: 5,
    expiry_date: inDays(45), is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-9", category: "other", sku: "MED-TEARS-01", name: "Artificial Tears Eye Drops",
    brand: "Systane", model: null, color: null, size: "10ml", unit: "bottle",
    cost_price: 180, selling_price: 420, quantity_on_hand: 18, reorder_threshold: 6,
    expiry_date: inDays(10), is_active: true, created_at: now, updated_at: now,
  },
  {
    id: "mock-inv-10", category: "other", sku: "MED-MOXI-01", name: "Moxifloxacin Eye Drops",
    brand: "Vigamox", model: null, color: null, size: "5ml", unit: "bottle",
    cost_price: 220, selling_price: 480, quantity_on_hand: 11, reorder_threshold: 5,
    expiry_date: inDays(66), is_active: true, created_at: now, updated_at: now,
  },
];

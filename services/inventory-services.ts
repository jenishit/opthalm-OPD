import { apiFetch } from "./http";
import type {
  AddStockRequest,
  CreateInventoryItemRequest,
  CreatePurchaseRequest,
  CreateVendorRequest,
  InventoryItem,
  Purchase,
  StockMovement,
  UpdateInventoryItemRequest,
  UpdateVendorRequest,
  Vendor,
} from "@/types/inventory-types";

// ── Items ───────────────────────────────────────────────────────────────────

export function createInventoryItem(body: CreateInventoryItemRequest): Promise<InventoryItem> {
  return apiFetch<InventoryItem>("/inventory/items", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listInventoryItems(limit = 100, offset = 0): Promise<InventoryItem[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<InventoryItem[]>(`/inventory/items?${params.toString()}`);
}

export function searchInventoryItems(query: string, limit = 50): Promise<InventoryItem[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<InventoryItem[]>(`/inventory/items/search?${params.toString()}`);
}

export function getInventoryItem(id: string): Promise<InventoryItem> {
  return apiFetch<InventoryItem>(`/inventory/items/${id}`);
}

export function updateInventoryItem(
  id: string,
  body: UpdateInventoryItemRequest
): Promise<void> {
  return apiFetch<void>(`/inventory/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteInventoryItem(id: string): Promise<void> {
  return apiFetch<void>(`/inventory/items/${id}/delete`, { method: "PATCH" });
}

/** POST /inventory/items/:id/stock — add stock to the item. */
export function addItemStock(id: string, body: AddStockRequest): Promise<void> {
  return apiFetch<void>(`/inventory/items/${id}/stock`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /inventory/items/:id/movements?limit&offset */
export function getItemMovements(id: string, limit = 50, offset = 0): Promise<StockMovement[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<StockMovement[]>(`/inventory/items/${id}/movements?${params.toString()}`);
}

/** GET /inventory/items/barcode/:sku */
export function getItemByBarcode(sku: string): Promise<InventoryItem> {
  return apiFetch<InventoryItem>(`/inventory/items/barcode/${encodeURIComponent(sku)}`);
}

/** GET /inventory/low-stock */
export function listLowStock(): Promise<InventoryItem[]> {
  return apiFetch<InventoryItem[]>("/inventory/low-stock");
}

// ── Vendors ─────────────────────────────────────────────────────────────────

export function createVendor(body: CreateVendorRequest): Promise<Vendor> {
  return apiFetch<Vendor>("/inventory/vendors", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listVendors(limit = 100, offset = 0): Promise<Vendor[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<Vendor[]>(`/inventory/vendors?${params.toString()}`);
}

export function searchVendors(query: string, limit = 50): Promise<Vendor[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<Vendor[]>(`/inventory/vendors/search?${params.toString()}`);
}

export function getVendor(id: string): Promise<Vendor> {
  return apiFetch<Vendor>(`/inventory/vendors/${id}`);
}

export function updateVendor(id: string, body: UpdateVendorRequest): Promise<void> {
  return apiFetch<void>(`/inventory/vendors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteVendor(id: string): Promise<void> {
  return apiFetch<void>(`/inventory/vendors/${id}/delete`, { method: "PATCH" });
}

// ── Purchases ───────────────────────────────────────────────────────────────

export function createPurchase(body: CreatePurchaseRequest): Promise<Purchase> {
  return apiFetch<Purchase>("/inventory/purchases", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listPurchases(limit = 100, offset = 0): Promise<Purchase[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<Purchase[]>(`/inventory/purchases?${params.toString()}`);
}

export function getPurchase(id: string): Promise<Purchase> {
  return apiFetch<Purchase>(`/inventory/purchases/${id}`);
}

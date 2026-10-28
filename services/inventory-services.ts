import { apiFetch } from "./http";
import type {
  AddStockRequest,
  CreateInventoryItemRequest,
  CreatePurchaseRequest,
  CreateVendorRequest,
  InventoryItemDTO,
  PurchaseDTO,
  StockMovementDTO,
  UpdateInventoryItemRequest,
  UpdateVendorRequest,
  VendorDTO,
} from "@/types/api-types";

// ── Items ───────────────────────────────────────────────────────────────────

export function createInventoryItem(body: CreateInventoryItemRequest): Promise<InventoryItemDTO> {
  return apiFetch<InventoryItemDTO>("/inventory/items", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listInventoryItems(limit = 100, offset = 0): Promise<InventoryItemDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<InventoryItemDTO[]>(`/inventory/items?${params.toString()}`);
}

export function searchInventoryItems(query: string, limit = 50): Promise<InventoryItemDTO[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<InventoryItemDTO[]>(`/inventory/items/search?${params.toString()}`);
}

export function getInventoryItem(id: string): Promise<InventoryItemDTO> {
  return apiFetch<InventoryItemDTO>(`/inventory/items/${id}`);
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
export function getItemMovements(id: string, limit = 50, offset = 0): Promise<StockMovementDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<StockMovementDTO[]>(`/inventory/items/${id}/movements?${params.toString()}`);
}

/** GET /inventory/items/barcode/:sku */
export function getItemByBarcode(sku: string): Promise<InventoryItemDTO> {
  return apiFetch<InventoryItemDTO>(`/inventory/items/barcode/${encodeURIComponent(sku)}`);
}

/** GET /inventory/low-stock */
export function listLowStock(): Promise<InventoryItemDTO[]> {
  return apiFetch<InventoryItemDTO[]>("/inventory/low-stock");
}

// ── Vendors ─────────────────────────────────────────────────────────────────

export function createVendor(body: CreateVendorRequest): Promise<VendorDTO> {
  return apiFetch<VendorDTO>("/inventory/vendors", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listVendors(limit = 100, offset = 0): Promise<VendorDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<VendorDTO[]>(`/inventory/vendors?${params.toString()}`);
}

export function searchVendors(query: string, limit = 50): Promise<VendorDTO[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<VendorDTO[]>(`/inventory/vendors/search?${params.toString()}`);
}

export function getVendor(id: string): Promise<VendorDTO> {
  return apiFetch<VendorDTO>(`/inventory/vendors/${id}`);
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

export function createPurchase(body: CreatePurchaseRequest): Promise<PurchaseDTO> {
  return apiFetch<PurchaseDTO>("/inventory/purchases", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listPurchases(limit = 100, offset = 0): Promise<PurchaseDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<PurchaseDTO[]>(`/inventory/purchases?${params.toString()}`);
}

export function getPurchase(id: string): Promise<PurchaseDTO> {
  return apiFetch<PurchaseDTO>(`/inventory/purchases/${id}`);
}

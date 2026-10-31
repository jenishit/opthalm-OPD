// Shapes for the /inventory endpoints (items, vendors, purchases). Mirrors
// the Go backend contract served at ${BACKEND_URL}/swagger/doc.json. There's
// no separate UI schema for inventory, so these are used directly.

export type InventoryCategory =
  | "frame"
  | "lens"
  | "contact_lens"
  | "sunglasses"
  | "coating"
  | "accessory"
  | "other";

export interface CreateInventoryItemRequest {
  category: InventoryCategory;
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  selling_price?: number;
  quantity_on_hand?: number;
  reorder_threshold?: number;
  unit?: string;
  /** ISO date (YYYY-MM-DD) the current stock expires on, e.g. for contacts, coatings, meds. */
  expiry_date?: string;
}

export interface UpdateInventoryItemRequest {
  category?: InventoryCategory;
  name?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  selling_price?: number;
  reorder_threshold?: number;
  /** ISO date (YYYY-MM-DD), or null to clear it. */
  expiry_date?: string | null;
}

export interface InventoryItem {
  id: string;
  category: InventoryCategory | string;
  sku: string;
  name: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  size: string | null;
  unit: string | null;
  cost_price: number;
  selling_price: number;
  quantity_on_hand: number;
  reorder_threshold: number;
  /** ISO date (YYYY-MM-DD) the current stock expires on; null when the item has no shelf life. */
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddStockRequest {
  quantity: number;
  notes?: string;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateVendorRequest {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseItemRequest {
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseRequest {
  vendor_id: string;
  invoice_ref_no?: string;
  paid_amount?: number;
  items: CreatePurchaseItemRequest[];
}

export interface PurchaseItem {
  id: string;
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface Purchase {
  id: string;
  vendor_id: string;
  vendor_name: string;
  invoice_ref_no: string | null;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  items: PurchaseItem[];
  created_at: string;
}

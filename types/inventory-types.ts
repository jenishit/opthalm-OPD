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
  /** Track stock in batches (lot number + expiry) — for contacts, solutions, drops. Expiry is entered when stock is received. */
  tracks_lots?: boolean;
  /** Public https URL of the product photo. */
  image_url?: string;
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
  image_url?: string | null;
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
  /** Legacy single expiry date — the backend now tracks expiry per batch, so this is normally absent. */
  expiry_date?: string | null;
  tracks_lots?: boolean;
  image_url?: string | null;
  /** Earliest expiry among batches still in stock (YYYY-MM-DD); can be in the past. Null when none. */
  next_expiry_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddStockRequest {
  quantity: number;
  notes?: string;
  /** Required for batch-tracked items. */
  lot_no?: string;
  /** YYYY-MM-DD — required when the lot is new; omit (or match) when adding to an existing lot. */
  expiry_date?: string;
  location_id?: string;
}

/** GET /inventory/items/:id/lots */
export interface ItemLot {
  lot_id?: string;
  lot_no: string;
  expiry_date: string;
  days_to_expiry: number;
  quantity: number;
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
  /** Batch / lot number (max 60). */
  lot_no?: string;
  /** ISO date (YYYY-MM-DD) this batch expires. */
  expiry_date?: string;
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

/** One lot of stock with an expiry date — GET /inventory/reports/expiring. */
export interface ExpiringLot {
  inventory_item_id: string;
  item_name: string;
  sku: string;
  lot_no: string;
  quantity: number;
  /** ISO date (YYYY-MM-DD). */
  expiry_date: string;
  /** Negative when already expired. */
  days_to_expiry: number;
}

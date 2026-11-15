import { create } from "zustand";
import { idbAvailable, idbGet, idbPut } from "@/lib/offline/idb";
import type { InventoryItem } from "@/types/inventory-types";
import type { PaymentMethod } from "@/types/billing-types";
import type { Patient } from "@/schemas/patient-schema";

export interface CartLine {
  item: InventoryItem;
  qty: number;
}

interface HeldSale {
  id: string;
  cart: CartLine[];
  customer: Patient | null;
  discount: number;
  heldAt: string;
}

interface PosState {
  cart: CartLine[];
  customer: Patient | null;
  discount: number;
  paymentMethod: PaymentMethod;
  heldSales: HeldSale[];

  addItem: (item: InventoryItem) => void;
  incrementQty: (itemId: string) => void;
  decrementQty: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  setCustomer: (patient: Patient | null) => void;
  setDiscount: (amount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearSale: () => void;
  holdSale: () => void;
  resumeSale: (id: string) => void;
  deleteHeldSale: (id: string) => void;
}

/** Local POS cart state — the backend has no "draft sale" concept, so held sales live only in this store. */
export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  customer: null,
  discount: 0,
  paymentMethod: "cash",
  heldSales: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.cart.find((l) => l.item.id === item.id);
      if (existing) {
        return { cart: state.cart.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l)) };
      }
      return { cart: [...state.cart, { item, qty: 1 }] };
    }),

  incrementQty: (itemId) =>
    set((state) => ({
      cart: state.cart.map((l) => (l.item.id === itemId ? { ...l, qty: l.qty + 1 } : l)),
    })),

  decrementQty: (itemId) =>
    set((state) => ({
      cart: state.cart
        .map((l) => (l.item.id === itemId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    })),

  removeItem: (itemId) => set((state) => ({ cart: state.cart.filter((l) => l.item.id !== itemId) })),

  setCustomer: (patient) => set({ customer: patient }),
  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearSale: () => set({ cart: [], customer: null, discount: 0 }),

  holdSale: () => {
    const { cart, customer, discount } = get();
    if (cart.length === 0) return;
    set((state) => ({
      heldSales: [
        { id: `held-${Date.now()}`, cart, customer, discount, heldAt: new Date().toISOString() },
        ...state.heldSales,
      ],
      cart: [],
      customer: null,
      discount: 0,
    }));
  },

  resumeSale: (id) =>
    set((state) => {
      const held = state.heldSales.find((h) => h.id === id);
      if (!held) return state;
      return {
        cart: held.cart,
        customer: held.customer,
        discount: held.discount,
        heldSales: state.heldSales.filter((h) => h.id !== id),
      };
    }),

  deleteHeldSale: (id) => set((state) => ({ heldSales: state.heldSales.filter((h) => h.id !== id) })),
}));

// ── Local persistence ───────────────────────────────────────────────────────
// The cart, selected customer and held sales are mirrored to IndexedDB so a
// refresh, crash or lost connection doesn't throw away work in progress. The
// draft holds patient data, so it is wiped on sign-out (lib/offline/cache.ts).

const DRAFT_KEY = "pos:draft";
let persistenceStarted = false;

export async function startPosPersistence(): Promise<void> {
  if (persistenceStarted || !idbAvailable()) return;
  persistenceStarted = true;
  try {
    const row = await idbGet<{ key: string; value: Partial<PosState> }>("kv", DRAFT_KEY);
    const s = usePosStore.getState();
    // Only restore into a pristine store — never clobber what the cashier just did.
    if (row?.value && s.cart.length === 0 && s.heldSales.length === 0) {
      const { cart, customer, discount, paymentMethod, heldSales } = row.value;
      usePosStore.setState({
        cart: cart ?? [],
        customer: customer ?? null,
        discount: discount ?? 0,
        paymentMethod: paymentMethod ?? "cash",
        heldSales: heldSales ?? [],
      });
    }
  } catch {
    /* start empty */
  }
  let timer: ReturnType<typeof setTimeout>;
  usePosStore.subscribe((s) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const { cart, customer, discount, paymentMethod, heldSales } = s;
      idbPut("kv", { key: DRAFT_KEY, value: { cart, customer, discount, paymentMethod, heldSales } }).catch(() => {});
    }, 250);
  });
}

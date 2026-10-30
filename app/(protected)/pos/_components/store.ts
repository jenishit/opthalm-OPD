import { create } from "zustand";
import type { InventoryItemDTO, PaymentMethod } from "@/types/api-types";
import type { Patient } from "@/schemas/patient-schema";

export interface CartLine {
  item: InventoryItemDTO;
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

  addItem: (item: InventoryItemDTO) => void;
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

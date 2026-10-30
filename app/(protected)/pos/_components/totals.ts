import type { CartLine } from "./store";

/** Nepal's standard VAT rate, applied to the discounted subtotal. */
export const VAT_RATE = 0.13;

export function computeTotals(cart: CartLine[], discount: number) {
  const subtotal = cart.reduce((sum, line) => sum + line.item.selling_price * line.qty, 0);
  const discounted = Math.max(0, subtotal - discount);
  const vat = discounted * VAT_RATE;
  const total = discounted + vat;
  return { subtotal, vat, total };
}

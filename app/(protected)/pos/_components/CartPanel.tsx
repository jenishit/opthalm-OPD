"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Glasses, Minus, Pause, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { formatCurrency } from "@/lib/utils";
import { PatientPicker } from "@/components/ui/PatientPicker";
import { usePosStore } from "./store";
import { computeTotals, VAT_RATE } from "./totals";
import { PaymentDialog } from "./PaymentDialog";

export function CartPanel() {
  const cart = usePosStore((s) => s.cart);
  const customer = usePosStore((s) => s.customer);
  const discount = usePosStore((s) => s.discount);
  const setCustomer = usePosStore((s) => s.setCustomer);
  const setDiscount = usePosStore((s) => s.setDiscount);
  const incrementQty = usePosStore((s) => s.incrementQty);
  const decrementQty = usePosStore((s) => s.decrementQty);
  const removeItem = usePosStore((s) => s.removeItem);
  const clearSale = usePosStore((s) => s.clearSale);
  const holdSale = usePosStore((s) => s.holdSale);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const { subtotal, vat, total } = computeTotals(cart, discount);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line/70 pb-3.5">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Current sale</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{cart.length} item(s) in cart</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearSale}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear sale"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-3.5">
        <PatientPicker customer={customer} onSelect={setCustomer} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <ShoppingCart className="size-7 text-muted-foreground/60" />
            Add products from the catalog to start a sale.
          </div>
        ) : (
          cart.map(({ item, qty }) => (
            <div key={item.id} className="flex items-start gap-2.5 border-b border-line/70 py-3 last:border-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sage-soft text-sage">
                <Glasses size={18} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <b className="text-xs text-foreground">{item.name}</b>
                <span className="text-xs text-muted-foreground">{formatCurrency(item.selling_price)} each</span>
                <div className="mt-0.5 flex items-center gap-2.5">
                  <button
                    onClick={() => decrementQty(item.id)}
                    className="grid size-6 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-sage"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="min-w-4 text-center text-xs font-semibold text-foreground">{qty}</span>
                  <button
                    onClick={() => {
                      if (item.quantity_on_hand > 0 && qty >= item.quantity_on_hand) {
                        toast.error(`Only ${item.quantity_on_hand} ${item.unit ?? "unit"}(s) in stock`);
                        return;
                      }
                      incrementQty(item.id);
                    }}
                    className="grid size-6 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-sage"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <b className="text-xs text-foreground">{formatCurrency(item.selling_price * qty)}</b>
              <button
                onClick={() => removeItem(item.id)}
                className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${item.name}`}
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line/70 pt-3">
        <span className="text-xs text-muted-foreground">Discount (Rs.)</span>
        <Input
          type="number"
          min={0}
          value={discount || ""}
          onChange={(e) => setDiscount(Number(e.target.value) || 0)}
          placeholder="0"
          className="h-8 w-24"
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-line/70 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <b className="text-foreground">{formatCurrency(subtotal)}</b>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <b className="text-foreground">− {formatCurrency(discount)}</b>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>VAT ({Math.round(VAT_RATE * 100)}%)</span>
          <b className="text-foreground">{formatCurrency(vat)}</b>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <span className="font-semibold text-foreground">Total due</span>
          <b className="font-display text-lg text-sage">{formatCurrency(total)}</b>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={cart.length === 0}
        onClick={() => setPaymentOpen(true)}
      >
        <CreditCard />
        Process payment · {formatCurrency(total)}
      </Button>
      <button
        onClick={() => {
          holdSale();
          toast.success("Sale held");
        }}
        disabled={cart.length === 0}
        className="mt-2 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <Pause className="size-3.5" />
        Hold sale
      </button>

      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}

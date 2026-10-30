"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, Loader2, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { cn, formatCurrency } from "@/lib/utils";
import { CATEGORY_TO_INVOICE_ITEM_TYPE } from "@/lib/inventory-category";
import { createInvoice, recordPayment } from "@/services/billing-services";
import { ApiError } from "@/services/http";
import type { InventoryCategory, PaymentMethod } from "@/types/api-types";
import { usePosStore } from "./store";
import { computeTotals, VAT_RATE } from "./totals";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank transfer", icon: Landmark },
  { value: "online", label: "Online", icon: Smartphone },
];

export function PaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const cart = usePosStore((s) => s.cart);
  const customer = usePosStore((s) => s.customer);
  const discount = usePosStore((s) => s.discount);
  const paymentMethod = usePosStore((s) => s.paymentMethod);
  const setPaymentMethod = usePosStore((s) => s.setPaymentMethod);
  const clearSale = usePosStore((s) => s.clearSale);
  const [saving, setSaving] = useState(false);

  const { subtotal, vat, total } = computeTotals(cart, discount);

  async function handleConfirm() {
    if (!customer) {
      toast.error("Select a patient before processing payment");
      return;
    }
    setSaving(true);
    try {
      const invoice = await createInvoice({
        patient_id: customer.id,
        discount_amount: discount || undefined,
        tax_amount: vat,
        items: cart.map((line) => ({
          item_type: CATEGORY_TO_INVOICE_ITEM_TYPE[line.item.category as InventoryCategory],
          description: [line.item.brand, line.item.name].filter(Boolean).join(" "),
          inventory_item_id: line.item.id,
          quantity: line.qty,
          unit_price: line.item.selling_price,
        })),
      });
      await recordPayment(invoice.id, { amount: invoice.total_amount, method: paymentMethod });
      toast.success(`Sale ${invoice.invoice_no} completed`);
      clearSale();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to process payment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Process payment</DialogTitle>

        <div className="rounded-md border border-line bg-app p-3.5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Customer</span>
            <span className="font-medium text-foreground">
              {customer ? `${customer.first_name} ${customer.last_name}` : "No patient selected"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Items</span>
            <span className="font-medium text-foreground">{cart.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
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
          <div className="mt-1 flex justify-between border-t border-line pt-2 text-base">
            <span className="font-semibold text-foreground">Total due</span>
            <b className="font-display text-xl text-sage">{formatCurrency(total)}</b>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPaymentMethod(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
                paymentMethod === value
                  ? "border-sage bg-sage-soft text-sage"
                  : "border-line bg-card text-muted-foreground hover:border-sage/50"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={saving || cart.length === 0}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            Confirm {formatCurrency(total)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

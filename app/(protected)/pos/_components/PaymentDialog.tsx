"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, Loader2, Smartphone, WifiOff } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { cn, formatCurrency } from "@/lib/utils";
import { idbAvailable } from "@/lib/offline/idb";
import { discardQueuedSale, enqueueSale, processSale, type QueuedSale } from "@/lib/offline/outbox";
import { useOnline } from "@/lib/offline/use-online";
import { useOpenShift } from "@/lib/pos/use-shift";
import type { PaymentMethod } from "@/types/billing-types";
import { usePosStore } from "./store";
import { computeTotals, VAT_RATE } from "./totals";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank transfer", icon: Landmark },
  { value: "online", label: "Online", icon: Smartphone },
];

export function PaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const online = useOnline();
  const { shift } = useOpenShift();
  const cart = usePosStore((s) => s.cart);
  const customer = usePosStore((s) => s.customer);
  const discount = usePosStore((s) => s.discount);
  const paymentMethod = usePosStore((s) => s.paymentMethod);
  const setPaymentMethod = usePosStore((s) => s.setPaymentMethod);
  const clearSale = usePosStore((s) => s.clearSale);
  const [saving, setSaving] = useState(false);
  // Synchronous lock: `saving` state updates too late to stop a fast double-click.
  const inFlight = useRef(false);
  // One attempt id per distinct sale, kept across retries so the server-side
  // idempotency key and the outbox progress are reused instead of duplicated.
  const attempt = useRef<{ signature: string; id: string } | null>(null);

  const { subtotal, vat, total } = computeTotals(cart, discount);

  async function handleConfirm() {
    if (!shift) return void toast.error("Open a shift before taking payment");
    if (!idbAvailable()) return void toast.error("This browser can't store sales safely. Use a current browser.");
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const signature = JSON.stringify([customer?.id ?? null, discount, paymentMethod, cart.map((l) => [l.item.id, l.qty])]);
      if (!attempt.current || attempt.current.signature !== signature) {
        attempt.current = { signature, id: crypto.randomUUID() };
      }
      const id = attempt.current.id;

      const queued: QueuedSale = {
        id,
        createdAt: new Date().toISOString(),
        shiftId: shift.id,
        status: "pending",
        attempts: 0,
        progress: {},
        sale: {
          patientId: customer?.id ?? null,
          patientName: customer ? `${customer.first_name} ${customer.last_name}`.trim() : "Walk-in customer",
          discount,
          vat,
          subtotal,
          total,
          method: paymentMethod,
          lines: cart.map((l) => ({
            itemId: l.item.id,
            category: l.item.category,
            description: [l.item.brand, l.item.name].filter(Boolean).join(" "),
            qty: l.qty,
            unitPrice: l.item.selling_price,
          })),
        },
      };

      // Write-ahead: the sale is durable on this device before any network call.
      await enqueueSale(queued);
      const result = await processSale(id);

      const finish = () => {
        attempt.current = null;
        clearSale();
        onOpenChange(false);
      };

      switch (result.kind) {
        case "done":
          toast.success(`Sale ${result.invoiceNo} completed`, {
            action: { label: "Print invoice", onClick: () => router.push(`/pos/invoice/${result.invoiceId}`) },
            duration: 10000,
          });
          finish();
          break;
        case "offline":
          toast.info("Saved offline — it will sync automatically when the connection is back.");
          finish();
          break;
        case "retry":
          toast.warning(`${result.message}. The sale is saved and will retry automatically.`);
          finish();
          break;
        case "rejected":
          if (!result.invoiceCreated) {
            // Nothing reached the server: remove it so the cashier can fix the cart.
            await discardQueuedSale(id);
            attempt.current = null;
            toast.error(result.message);
          } else {
            toast.error(`Invoice created but payment failed: ${result.message}. See the sync queue.`);
            finish();
          }
          break;
      }
    } catch {
      toast.error("Could not save the sale on this device. Nothing was charged.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Process payment</DialogTitle>

        {!online && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">
            <WifiOff className="size-4 shrink-0" />
            You&apos;re offline. The sale will be saved on this device and synced automatically.
          </div>
        )}
        {!shift && (
          <div role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-xs text-bad-ink">
            No shift is open on this terminal. Open a shift from the POS header first.
          </div>
        )}

        <div className="rounded-md border border-line bg-app p-3.5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Customer</span>
            <span className="font-medium text-foreground">
              {customer ? `${customer.first_name} ${customer.last_name}` : "Walk-in customer"}
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

        <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={paymentMethod === value}
              onClick={() => setPaymentMethod(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
                paymentMethod === value
                  ? "border-sage bg-sage-soft text-sage"
                  : "border-line bg-card text-muted-foreground hover:border-strong",
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
          <Button onClick={handleConfirm} disabled={saving || cart.length === 0 || !shift}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            {online ? "Confirm" : "Save offline"} {formatCurrency(total)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { formatCurrency } from "@/lib/utils";
import { usePosStore } from "./store";
import { computeTotals } from "./totals";

export function HeldSalesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const heldSales = usePosStore((s) => s.heldSales);
  const resumeSale = usePosStore((s) => s.resumeSale);
  const deleteHeldSale = usePosStore((s) => s.deleteHeldSale);
  const cart = usePosStore((s) => s.cart);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Held sales</DialogTitle>
        {heldSales.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No sales are currently on hold.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {heldSales.map((held) => {
              const { total } = computeTotals(held.cart, held.discount);
              return (
                <div
                  key={held.id}
                  className="flex items-center gap-3 rounded-md border border-line bg-app p-3"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <b className="text-sm text-foreground">
                      {held.customer ? `${held.customer.first_name} ${held.customer.last_name}` : "Walk-in customer"}
                    </b>
                    <span className="text-xs text-muted-foreground">
                      {held.cart.length} item{held.cart.length === 1 ? "" : "s"} · {formatCurrency(total)} ·{" "}
                      {new Date(held.heldAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={cart.length > 0}
                    onClick={() => {
                      resumeSale(held.id);
                      onOpenChange(false);
                    }}
                    title={cart.length > 0 ? "Finish or hold the current sale first" : undefined}
                  >
                    <RotateCcw className="size-3.5" />
                    Resume
                  </Button>
                  <button
                    onClick={() => {
                      deleteHeldSale(held.id);
                      toast.info("Held sale discarded");
                    }}
                    className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Discard held sale"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

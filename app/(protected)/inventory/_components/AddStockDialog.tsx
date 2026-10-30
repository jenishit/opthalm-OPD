"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { addItemStock } from "@/services/inventory-services";
import { ApiError } from "@/services/http";
import type { InventoryItemDTO } from "@/types/api-types";

export function AddStockDialog({
  item,
  onOpenChange,
  onUpdated,
}: {
  item: InventoryItemDTO | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error("Enter a quantity greater than zero");
      return;
    }
    setSaving(true);
    try {
      await addItemStock(item.id, { quantity: qty, notes: notes.trim() || undefined });
      toast.success(`Added ${qty} ${item.unit ?? "unit"}(s) to ${item.name}`);
      setQuantity("");
      setNotes("");
      onOpenChange(false);
      onUpdated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuantity("");
          setNotes("");
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Add stock</DialogTitle>
        {item && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="rounded-md border border-line bg-app p-3">
              <div className="font-display text-sm font-semibold text-foreground">{item.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {item.sku} · {item.quantity_on_hand} {item.unit ?? "units"} on hand
              </div>
            </div>
            <Field>
              <FieldLabel>Quantity to add</FieldLabel>
              <Input
                autoFocus
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. New vendor delivery"
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <PackagePlus className="size-4" />}
                Add stock
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

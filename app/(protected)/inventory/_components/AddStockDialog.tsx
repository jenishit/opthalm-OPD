"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { FormField } from "@/components/forms";
import { addStockSchema, type AddStockForm } from "@/schemas/inventory-schema";
import { addItemStock, getItemLots } from "@/services/inventory-services";
import { useAsync } from "@/lib/hooks/use-async";
import { ApiError } from "@/services/http";
import type { InventoryItem, ItemLot } from "@/types/inventory-types";

function StockForm({
  item,
  onOpenChange,
  onUpdated,
}: {
  item: InventoryItem;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const { control, handleSubmit, formState, setError } = useForm<AddStockForm>({
    resolver: zodResolver(addStockSchema),
    defaultValues: { quantity: "", notes: "", lot: "", expiry: "" },
  });

  // Existing batches, so stock can be added to one (no expiry needed) or a new batch started.
  const lots = useAsync(() => (item.tracks_lots ? getItemLots(item.id, true) : Promise.resolve([] as ItemLot[])));
  const lotNo = useWatch({ control, name: "lot" });
  const existing = (lots.data ?? []).find((l) => l.lot_no === lotNo.trim());

  async function onSubmit(v: AddStockForm) {
    if (item.tracks_lots) {
      if (!v.lot) return void setError("lot", { type: "manual", message: "Batch number is required for this product" });
      if (!existing && !v.expiry) return void setError("expiry", { type: "manual", message: "A new batch needs an expiry date" });
    }
    try {
      const qty = Number(v.quantity);
      await addItemStock(item.id, {
        quantity: qty,
        notes: v.notes || undefined,
        ...(item.tracks_lots ? { lot_no: v.lot, expiry_date: existing ? undefined : v.expiry || undefined } : {}),
      });
      toast.success(`Added ${qty} ${item.unit ?? "unit"}(s) to ${item.name}`);
      onOpenChange(false);
      onUpdated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add stock");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
      <div className="rounded-md border border-line bg-app p-3">
        <div className="font-display text-sm font-semibold text-foreground">{item.name}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {item.sku} · {item.quantity_on_hand} {item.unit ?? "units"} on hand
        </div>
      </div>
      <FormField control={control} name="quantity" label="Quantity to add">
        {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={1} aria-invalid={invalid} autoFocus />}
      </FormField>
      {item.tracks_lots && (
        <div className="grid grid-cols-2 gap-3 rounded-md border border-line bg-app p-3">
          <FormField control={control} name="lot" label="Batch / lot no">
            {({ field, id, invalid }) => (
              <>
                <Input {...field} id={id} list={`${id}-lots`} maxLength={60} aria-invalid={invalid} autoComplete="off" />
                <datalist id={`${id}-lots`}>
                  {(lots.data ?? []).map((l) => <option key={l.lot_no} value={l.lot_no}>{`exp ${l.expiry_date.slice(0, 10)} · ${l.quantity} left`}</option>)}
                </datalist>
              </>
            )}
          </FormField>
          <FormField control={control} name="expiry" label="Expiry date" description={existing ? `Existing batch — expires ${existing.expiry_date.slice(0, 10)}` : "Required for a new batch"}>
            {({ field, id, invalid }) => <Input {...field} id={id} type="date" disabled={!!existing} value={existing ? existing.expiry_date.slice(0, 10) : field.value} aria-invalid={invalid} />}
          </FormField>
        </div>
      )}
      <FormField control={control} name="notes" label="Notes (optional)">
        {({ field, id, invalid }) => <Input {...field} id={id} placeholder="e.g. New vendor delivery" aria-invalid={invalid} />}
      </FormField>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <PackagePlus className="size-4" />}
          Add stock
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddStockDialog({
  item,
  onOpenChange,
  onUpdated,
}: {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add stock</DialogTitle>
        {/* Keyed by item so the form state resets whenever a different product is opened. */}
        {item && <StockForm key={item.id} item={item} onOpenChange={onOpenChange} onUpdated={onUpdated} />}
      </DialogContent>
    </Dialog>
  );
}

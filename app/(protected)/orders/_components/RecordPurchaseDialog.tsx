"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { FormField, NativeSelect } from "@/components/forms";
import { useAsync } from "@/lib/hooks/use-async";
import { fetchAll } from "@/lib/pagination";
import { formatCurrency } from "@/lib/utils";
import { purchaseSchema, type PurchaseForm } from "@/schemas/purchase-schema";
import { ApiError } from "@/services/http";
import { createPurchase, listInventoryItems, listVendors } from "@/services/inventory-services";

const blankLine = { itemId: "", qty: "1", cost: "", lot: "", expiry: "" };
const DEFAULTS: PurchaseForm = { vendorId: "", billNo: "", paid: "", lines: [blankLine] };

export function RecordPurchaseDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const vendors = useAsync(async () => (await fetchAll(listVendors)).items);
  const items = useAsync(async () => (await fetchAll(listInventoryItems)).items);

  const { control, handleSubmit, reset, formState, setError } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: DEFAULTS,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = useWatch({ control, name: "lines" });
  const total = (lines ?? []).reduce((s, l) => {
    const t = Number(l?.qty) * Number(l?.cost);
    return s + (Number.isFinite(t) ? t : 0);
  }, 0);

  const close = (next: boolean) => {
    if (!next) reset(DEFAULTS);
    onOpenChange(next);
  };

  const tracked = (itemId: string) => items.data?.find((it) => it.id === itemId)?.tracks_lots === true;

  async function onSubmit(v: PurchaseForm) {
    // Batch-tracked products need an expiry, or the stock never shows up in the expiry tracker.
    let missing = false;
    v.lines.forEach((l, i) => {
      if (tracked(l.itemId) && !l.expiry) {
        setError(`lines.${i}.expiry`, { type: "manual", message: "Expiry date is required for this product" });
        missing = true;
      }
    });
    if (missing) return;
    try {
      await createPurchase({
        vendor_id: v.vendorId,
        invoice_ref_no: v.billNo || undefined,
        paid_amount: v.paid ? Number(v.paid) : undefined,
        items: v.lines.map((l) => ({
          inventory_item_id: l.itemId,
          quantity: Number(l.qty),
          unit_cost: Number(l.cost),
          lot_no: l.lot || undefined,
          expiry_date: l.expiry || undefined,
        })),
      });
      toast.success("Purchase recorded — stock updated");
      close(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to record the purchase");
    }
  }

  const linesError = formState.errors.lines?.root?.message ?? formState.errors.lines?.message;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogTitle>Record supplier purchase</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={control} name="vendorId" label="Vendor">
              {({ field, id, invalid }) => (
                <NativeSelect {...field} id={id} aria-invalid={invalid}>
                  <option value="">{vendors.loading ? "Loading…" : "Select vendor"}</option>
                  {(vendors.data ?? []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </NativeSelect>
              )}
            </FormField>
            <FormField control={control} name="billNo" label="Bill / invoice no">
              {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} />}
            </FormField>
          </div>
          {(vendors.error || items.error) && (
            <p role="alert" className="text-xs text-destructive">Couldn&apos;t load vendors or products. Close and reopen to retry.</p>
          )}

          {fields.map((f, i) => (
            <div key={f.id} className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_72px_96px_32px] items-start gap-2">
              <FormField control={control} name={`lines.${i}.itemId`} label={i === 0 ? "Product" : <span className="sr-only">Product {i + 1}</span>}>
                {({ field, id, invalid }) => (
                  <NativeSelect {...field} id={id} aria-invalid={invalid}>
                    <option value="">{items.loading ? "Loading…" : "Select product"}</option>
                    {(items.data ?? []).map((it) => (
                      <option key={it.id} value={it.id}>{[it.brand, it.name].filter(Boolean).join(" ")} · {it.sku}</option>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <FormField control={control} name={`lines.${i}.qty`} label={i === 0 ? "Qty" : <span className="sr-only">Quantity {i + 1}</span>}>
                {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={1} step={1} aria-invalid={invalid} />}
              </FormField>
              <FormField control={control} name={`lines.${i}.cost`} label={i === 0 ? "Unit cost" : <span className="sr-only">Unit cost {i + 1}</span>}>
                {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={0} step="0.01" aria-invalid={invalid} />}
              </FormField>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove line ${i + 1}`} disabled={fields.length === 1} onClick={() => remove(i)} className={i === 0 ? "mt-[22px]" : ""}>
                <Trash2 className="size-4" />
              </Button>
            </div>
            {tracked(lines?.[i]?.itemId ?? "") && (
              <div className="grid grid-cols-2 gap-2 rounded-md border border-line bg-app p-2">
                <FormField control={control} name={`lines.${i}.lot`} label="Batch / lot no">
                  {({ field, id, invalid }) => <Input {...field} id={id} maxLength={60} aria-invalid={invalid} />}
                </FormField>
                <FormField control={control} name={`lines.${i}.expiry`} label="Expiry date">
                  {({ field, id, invalid }) => <Input {...field} id={id} type="date" aria-invalid={invalid} />}
                </FormField>
              </div>
            )}
            </div>
          ))}
          {linesError && <p role="alert" className="text-xs text-destructive">{linesError}</p>}
          <Button type="button" variant="ghost" className="self-start gap-1.5" onClick={() => append(blankLine)}>
            <Plus className="size-4" /> Add line
          </Button>

          <div className="grid grid-cols-2 items-start gap-3">
            <FormField control={control} name="paid" label="Paid now">
              {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={0} step="0.01" aria-invalid={invalid} />}
            </FormField>
            <div className="pt-1 text-right text-sm">
              <div className="text-muted-foreground">Total</div>
              <b>{formatCurrency(total)}</b>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Record purchase
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

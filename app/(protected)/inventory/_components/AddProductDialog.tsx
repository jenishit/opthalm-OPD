"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { FormField } from "@/components/forms";
import { addProductSchema, type AddProductForm } from "@/schemas/inventory-schema";
import { createInventoryItem } from "@/services/inventory-services";
import { ApiError } from "@/services/http";
import { CATEGORY_LABEL } from "@/lib/inventory-category";

const EMPTY: AddProductForm = {
  category: "frame",
  sku: "",
  name: "",
  brand: "",
  model: "",
  color: "",
  size: "",
  unit: "pc",
  cost_price: "",
  selling_price: "",
  quantity_on_hand: "",
  reorder_threshold: "",
  tracks_lots: false,
  image_url: "",
};

const num = (v: string) => (v ? Number(v) : undefined);

export function AddProductDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { control, handleSubmit, reset, formState } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  const close = (next: boolean) => {
    if (!next) reset(EMPTY);
    onOpenChange(next);
  };

  async function onSubmit(v: AddProductForm) {
    try {
      await createInventoryItem({
        category: v.category,
        sku: v.sku,
        name: v.name,
        brand: v.brand || undefined,
        model: v.model || undefined,
        color: v.color || undefined,
        size: v.size || undefined,
        unit: v.unit || undefined,
        cost_price: num(v.cost_price),
        selling_price: num(v.selling_price),
        quantity_on_hand: num(v.quantity_on_hand),
        reorder_threshold: num(v.reorder_threshold),
        tracks_lots: v.tracks_lots || undefined,
        image_url: v.image_url || undefined,
      });
      toast.success(`${v.name} added to inventory`);
      close(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add product");
    }
  }

  const text = (name: "sku" | "name" | "brand" | "model" | "color" | "size", label: string) => (
    <FormField control={control} name={name} label={label}>
      {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} />}
    </FormField>
  );
  const number = (name: "cost_price" | "selling_price" | "quantity_on_hand" | "reorder_threshold", label: string, step?: string) => (
    <FormField control={control} name={name} label={label}>
      {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={0} step={step} aria-invalid={invalid} />}
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Add product</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={control} name="category" label="Category">
              {({ field, id }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={id} className="w-full" onBlur={field.onBlur}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            {text("sku", "SKU / barcode")}
          </div>
          {text("name", "Product name")}
          <div className="grid grid-cols-2 gap-3">
            {text("brand", "Brand")}
            {text("model", "Model")}
            {text("color", "Color")}
            {text("size", "Size")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {number("cost_price", "Cost price (Rs.)", "0.01")}
            {number("selling_price", "Selling price (Rs.)", "0.01")}
            {number("quantity_on_hand", "Opening stock")}
            {number("reorder_threshold", "Reorder threshold")}
          </div>
          <FormField control={control} name="image_url" label="Product image link (optional)" description="A public https:// link to a photo of the product.">
            {({ field, id, invalid }) => <Input {...field} id={id} type="url" inputMode="url" placeholder="https://…" aria-invalid={invalid} />}
          </FormField>
          <FormField control={control} name="tracks_lots" label="Batches & expiry" description="For contact lenses, solutions and drops. Batch number and expiry date are entered when you record the purchase.">
            {({ field, id }) => (
              <label htmlFor={id} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox id={id} checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                Track this product by batch and expiry
              </label>
            )}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

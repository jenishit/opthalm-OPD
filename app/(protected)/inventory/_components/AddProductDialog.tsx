"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { createInventoryItem } from "@/services/inventory-services";
import { ApiError } from "@/services/http";
import type { InventoryCategory } from "@/types/inventory-types";
import { CATEGORY_LABEL } from "@/lib/inventory-category";

const EMPTY = {
  category: "frame" as InventoryCategory,
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
  expiry_date: "",
};

export function AddProductDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim()) {
      toast.error("SKU and product name are required");
      return;
    }
    setSaving(true);
    try {
      await createInventoryItem({
        category: form.category,
        sku: form.sku.trim(),
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        model: form.model.trim() || undefined,
        color: form.color.trim() || undefined,
        size: form.size.trim() || undefined,
        unit: form.unit.trim() || undefined,
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        selling_price: form.selling_price ? Number(form.selling_price) : undefined,
        quantity_on_hand: form.quantity_on_hand ? Number(form.quantity_on_hand) : undefined,
        reorder_threshold: form.reorder_threshold ? Number(form.reorder_threshold) : undefined,
        expiry_date: form.expiry_date || undefined,
      });
      toast.success(`${form.name} added to inventory`);
      setForm(EMPTY);
      onOpenChange(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setForm(EMPTY);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Add product</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as InventoryCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>SKU / barcode</FieldLabel>
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
            </Field>
          </div>

          <Field>
            <FieldLabel>Product name</FieldLabel>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Brand</FieldLabel>
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Model</FieldLabel>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Input value={form.color} onChange={(e) => set("color", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Size</FieldLabel>
              <Input value={form.size} onChange={(e) => set("size", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Cost price (Rs.)</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Selling price (Rs.)</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.selling_price}
                onChange={(e) => set("selling_price", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Opening stock</FieldLabel>
              <Input
                type="number"
                min={0}
                value={form.quantity_on_hand}
                onChange={(e) => set("quantity_on_hand", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Reorder threshold</FieldLabel>
              <Input
                type="number"
                min={0}
                value={form.reorder_threshold}
                onChange={(e) => set("reorder_threshold", e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Expiry date (optional)</FieldLabel>
            <Input
              type="date"
              value={form.expiry_date}
              onChange={(e) => set("expiry_date", e.target.value)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

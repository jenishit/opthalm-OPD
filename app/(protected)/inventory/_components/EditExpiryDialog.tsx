"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { updateInventoryItem } from "@/services/inventory-services";
import { ApiError } from "@/services/http";
import type { InventoryItemDTO } from "@/types/api-types";

function ExpiryForm({
  item,
  onOpenChange,
  onUpdated,
}: {
  item: InventoryItemDTO;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const [expiryDate, setExpiryDate] = useState(item.expiry_date ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateInventoryItem(item.id, { expiry_date: expiryDate || null });
      toast.success(expiryDate ? `Expiry set for ${item.name}` : `Expiry cleared for ${item.name}`);
      onOpenChange(false);
      onUpdated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to update expiry date");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="rounded-md border border-line bg-app p-3">
        <div className="font-display text-sm font-semibold text-foreground">{item.name}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {item.sku} · {item.quantity_on_hand} {item.unit ?? "units"} on hand
        </div>
      </div>
      <Field>
        <FieldLabel>Expiry date</FieldLabel>
        <Input
          autoFocus
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditExpiryDialog({
  item,
  onOpenChange,
  onUpdated,
}: {
  item: InventoryItemDTO | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Set expiry date</DialogTitle>
        {item && <ExpiryForm key={item.id} item={item} onOpenChange={onOpenChange} onUpdated={onUpdated} />}
      </DialogContent>
    </Dialog>
  );
}

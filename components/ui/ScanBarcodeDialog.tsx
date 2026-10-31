"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ScanBarcode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { getItemByBarcode } from "@/services/inventory-services";
import type { InventoryItem } from "@/types/inventory-types";

export function ScanBarcodeDialog({
  open,
  onOpenChange,
  onFound,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFound: (item: InventoryItem) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;
    setLoading(true);
    try {
      const item = await getItemByBarcode(value);
      onFound(item);
      onOpenChange(false);
      setCode("");
    } catch {
      toast.error(`No product found for "${value}"`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setCode("");
      }}
    >
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <ScanBarcode className="size-5 text-sage" />
          Scan barcode
        </DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Use a connected scanner, or type the SKU / barcode and press enter.
          </p>
          <Input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan or enter SKU / barcode…"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !code.trim()}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanBarcode className="size-4" />
              )}
              Find product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

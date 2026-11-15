"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { FormField } from "@/components/forms";
import { closeShiftSchema, type CloseShiftForm } from "@/schemas/shift-schema";
import { useOutbox } from "@/lib/offline/use-outbox";
import { refundsForShift, salesForShift } from "@/lib/pos/ledger";
import { closeShift, type Shift } from "@/lib/pos/shift";
import { computeZReport, type ZReport } from "@/lib/pos/zreport";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export function CloseShiftDialog({
  shift,
  open,
  onOpenChange,
}: {
  shift: Shift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const staffName = useAuthStore((s) => s.staffUser?.name ?? "Staff");
  const { pending, failed } = useOutbox();
  const [preview, setPreview] = useState<ZReport | null>(null);
  const expected = preview?.expectedCash ?? 0;
  // Re-built when the expected cash is known, so the "explain the difference" rule uses it.
  const schema = useMemo(() => closeShiftSchema(expected), [expected]);
  const { control, handleSubmit, formState } = useForm<CloseShiftForm>({
    resolver: zodResolver(schema),
    defaultValues: { countedCash: "", notes: "" },
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      const [sales, refunds] = await Promise.all([salesForShift(shift.id), refundsForShift(shift.id)]);
      if (!active) return;
      setPreview(
        computeZReport({
          zNumber: 0, shiftId: shift.id, openedAt: shift.openedAt, closedAt: new Date().toISOString(),
          openedBy: shift.openedBy, closedBy: staffName, openingFloat: shift.openingFloat,
          countedCash: 0, notes: "", sales, refunds,
        }),
      );
    })().catch(() => {});
    return () => { active = false; };
  }, [open, shift, staffName]);

  const countedRaw = useWatch({ control, name: "countedCash" });
  const countedNum = countedRaw === "" ? NaN : Number(countedRaw);
  const variance = preview && Number.isFinite(countedNum) ? countedNum - preview.expectedCash : null;

  async function onSubmit(v: CloseShiftForm) {
    try {
      const closed = await closeShift(shift.id, staffName, Number(v.countedCash), v.notes);
      toast.success(`Shift closed — Z-report #${closed.z?.zNumber}`);
      onOpenChange(false);
      router.push(`/pos/shifts/${closed.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close the shift");
    }
  }

  const row = (label: string, value: string, strong = false) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Close shift</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          {(pending > 0 || failed > 0) && (
            <div role="alert" className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">
              {pending + failed} sale(s) haven&apos;t synced yet. They&apos;re included in this report but flagged as
              unsynced — sync them before filing the report if you can.
            </div>
          )}
          {preview && (
            <div className="space-y-1.5 rounded-md border border-line bg-app p-3.5">
              {row("Sales", `${preview.salesCount} · ${formatCurrency(preview.netSales)}`)}
              {row("Refunds", `${preview.refundCount} · ${formatCurrency(preview.totalRefunds)}`)}
              {row("Opening float", formatCurrency(preview.openingFloat))}
              {row("Expected cash in drawer", formatCurrency(preview.expectedCash), true)}
            </div>
          )}
          <FormField control={control} name="countedCash" label="Cash counted in drawer (Rs.)">
            {({ field, id, invalid }) => <Input {...field} id={id} type="number" min={0} step="0.01" aria-invalid={invalid} autoFocus />}
          </FormField>
          {variance !== null && (
            <p role="status" className={variance === 0 ? "text-xs text-ok-ink" : "text-xs text-bad-ink"}>
              {variance === 0 ? "Drawer balances." : `${variance > 0 ? "Over" : "Short"} by ${formatCurrency(Math.abs(variance))}`}
            </p>
          )}
          <FormField control={control} name="notes" label={variance ? "Notes (explain the difference)" : "Notes (optional)"}>
            {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Close & print Z-report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

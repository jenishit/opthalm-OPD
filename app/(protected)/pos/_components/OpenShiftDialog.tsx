"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { FormField } from "@/components/forms";
import { openShift } from "@/lib/pos/shift";
import { openShiftSchema, type OpenShiftForm } from "@/schemas/shift-schema";
import { useAuthStore } from "@/stores/authStore";

export function OpenShiftDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const staffName = useAuthStore((s) => s.staffUser?.name ?? "Staff");
  const { control, handleSubmit, reset, formState } = useForm<OpenShiftForm>({
    resolver: zodResolver(openShiftSchema),
    defaultValues: { openingFloat: "" },
  });

  async function onSubmit(v: OpenShiftForm) {
    try {
      await openShift(staffName, v.openingFloat ? Number(v.openingFloat) : 0);
      toast.success("Shift opened");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open the shift");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Open shift</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Count the cash in the drawer and enter it as the opening float. Every sale and refund until you close the
            shift is included in its Z-report.
          </p>
          <FormField control={control} name="openingFloat" label="Opening float (Rs.)">
            {({ field, id, invalid }) => (
              <Input {...field} id={id} type="number" min={0} step="0.01" placeholder="0" aria-invalid={invalid} autoFocus />
            )}
          </FormField>
          <p className="text-xs text-muted-foreground">Cashier: {staffName}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Open shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Undo2, WifiOff } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { FormField, NativeSelect } from "@/components/forms";
import { useOnline } from "@/lib/offline/use-online";
import { saveRefund } from "@/lib/pos/ledger";
import { getOpenShift } from "@/lib/pos/shift";
import { formatCurrency } from "@/lib/utils";
import { refundSchema, type RefundForm as RefundValues } from "@/schemas/refund-schema";
import { ApiError } from "@/services/http";
import { refundInvoice } from "@/services/billing-services";
import type { Invoice, PaymentMethod } from "@/types/billing-types";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "online", label: "Online" },
];

export function RefundForm({ invoice, onRefunded }: { invoice: Invoice; onRefunded: () => void }) {
  const online = useOnline();
  // paid_amount is already net of earlier refunds (the backend lowers it).
  const refundable = invoice.paid_amount;
  const schema = useMemo(() => refundSchema(refundable), [refundable]);

  const { control, handleSubmit, reset, setValue } = useForm<RefundValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", method: "cash", reason: "" },
  });
  // Two-step: validate → confirm → submit. `review` holds the validated values.
  const [review, setReview] = useState<RefundValues | null>(null);
  // One idempotency key per refund attempt; renewed only after it succeeds.
  const attemptKey = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const [saving, setSaving] = useState(false);

  async function confirm() {
    if (!review || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const amount = Number(review.amount);
      await refundInvoice(invoice.id, { amount, method: review.method, notes: review.reason }, attemptKey.current);
      const shift = await getOpenShift().catch(() => null);
      await saveRefund({
        id: attemptKey.current,
        shiftId: shift?.id ?? null,
        at: new Date().toISOString(),
        invoiceId: invoice.id,
        invoiceNo: invoice.invoice_no,
        amount,
        method: review.method,
        notes: review.reason,
      });
      toast.success(`Refunded ${formatCurrency(amount)}`, {
        description: shift ? undefined : "No shift is open, so this refund isn't in any Z-report.",
      });
      attemptKey.current = crypto.randomUUID();
      setReview(null);
      reset();
      onRefunded();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Refund failed — nothing was changed. Check the connection and try again.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit((v) => setReview(v))} noValidate className="space-y-3 border-t border-line pt-4">
      {!online && (
        <p role="status" className="flex items-center gap-2 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn-ink">
          <WifiOff className="size-4" /> Refunds need a connection — they can&apos;t be queued offline.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField control={control} name="amount" label={`Refund amount (max ${formatCurrency(refundable)})`}>
          {({ field, id, invalid }) => (
            <>
              <Input
                {...field}
                id={id}
                type="number"
                min={0.01}
                max={refundable}
                step="0.01"
                aria-invalid={invalid}
                onChange={(e) => {
                  field.onChange(e);
                  setReview(null);
                }}
              />
              <button type="button" className="self-start text-xs font-semibold text-sage underline" onClick={() => { setValue("amount", String(refundable), { shouldValidate: true }); setReview(null); }}>
                Refund everything paid
              </button>
            </>
          )}
        </FormField>
        <FormField control={control} name="method" label="Returned via">
          {({ field, id, invalid }) => (
            <NativeSelect {...field} id={id} aria-invalid={invalid}>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </NativeSelect>
          )}
        </FormField>
      </div>
      <FormField control={control} name="reason" label="Reason (required, kept on the record)">
        {({ field, id, invalid }) => (
          <Input {...field} id={id} aria-invalid={invalid} placeholder="e.g. wrong frame returned, unfit for use" onChange={(e) => { field.onChange(e); setReview(null); }} />
        )}
      </FormField>

      {review ? (
        <div className="flex items-center gap-3 rounded-md border border-bad bg-bad-soft p-3">
          <p className="flex-1 text-sm text-bad-ink">
            Refund <b>{formatCurrency(Number(review.amount))}</b> to {invoice.patient_name || "Walk-in customer"} by{" "}
            {METHODS.find((m) => m.value === review.method)?.label.toLowerCase()}? This can&apos;t be undone.
          </p>
          <Button type="button" variant="ghost" onClick={() => setReview(null)}>Back</Button>
          <Button type="button" variant="destructive" onClick={confirm} disabled={saving || !online}>
            {saving && <Loader2 className="size-4 animate-spin" />} Confirm refund
          </Button>
        </div>
      ) : (
        <Button type="submit" disabled={!online}>
          <Undo2 /> Review refund
        </Button>
      )}
    </form>
  );
}

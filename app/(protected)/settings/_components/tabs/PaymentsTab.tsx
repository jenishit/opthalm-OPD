"use client";

import { useRef, useState } from "react";
import { useWatch, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, Loader2, QrCode, Upload } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { NativeSelect } from "@/components/forms";
import { paymentConfigSchema, type PaymentConfigForm } from "@/schemas/clinic-settings-schema";
import { getPaymentConfig, updatePaymentConfig, uploadPaymentQrCode } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicPaymentConfig } from "@/types/clinic-types";
import { SaveRow } from "../SaveRow";
import { SettingsField, SettingsLoading, ToggleField, settingsInput, useSettingsForm } from "../settings-form";

const EMPTY: PaymentConfigForm = {
  cash_enabled: true, card_enabled: false, bank_transfer_enabled: false, qr_wallet_enabled: false,
  tax_label: "", tax_rate: "", vat_registration_no: "", pan_number: "",
  bank_name: "", bank_account_holder: "", bank_account_number: "", bank_branch: "", bank_swift_code: "",
  qr_wallet_provider: "eSewa", qr_wallet_merchant_id: "", qr_code_url: "",
};

const toForm = (c: ClinicPaymentConfig): PaymentConfigForm => ({
  cash_enabled: c.cash_enabled,
  card_enabled: c.card_enabled,
  bank_transfer_enabled: c.bank_transfer_enabled,
  qr_wallet_enabled: c.qr_wallet_enabled,
  tax_label: c.tax_label ?? "",
  tax_rate: c.tax_rate ?? "",
  vat_registration_no: c.vat_registration_no ?? "",
  pan_number: c.pan_number ?? "",
  bank_name: c.bank_name ?? "",
  bank_account_holder: c.bank_account_holder ?? "",
  bank_account_number: c.bank_account_number ?? "",
  bank_branch: c.bank_branch ?? "",
  bank_swift_code: c.bank_swift_code ?? "",
  qr_wallet_provider: c.qr_wallet_provider ?? "eSewa",
  qr_wallet_merchant_id: c.qr_wallet_merchant_id ?? "",
  qr_code_url: c.qr_code_url ?? "",
});

const orUndef = (v: string) => v || undefined;
const toRequest = (v: PaymentConfigForm): ClinicPaymentConfig => ({
  cash_enabled: v.cash_enabled,
  card_enabled: v.card_enabled,
  bank_transfer_enabled: v.bank_transfer_enabled,
  qr_wallet_enabled: v.qr_wallet_enabled,
  tax_label: orUndef(v.tax_label),
  tax_rate: orUndef(v.tax_rate),
  vat_registration_no: orUndef(v.vat_registration_no),
  pan_number: orUndef(v.pan_number),
  bank_name: orUndef(v.bank_name),
  bank_account_holder: orUndef(v.bank_account_holder),
  bank_account_number: orUndef(v.bank_account_number),
  bank_branch: orUndef(v.bank_branch),
  bank_swift_code: orUndef(v.bank_swift_code),
  qr_wallet_provider: orUndef(v.qr_wallet_provider),
  qr_wallet_merchant_id: orUndef(v.qr_wallet_merchant_id),
  qr_code_url: orUndef(v.qr_code_url),
});

/** Merchant QR upload: the file goes to the server, the returned URL lands in the form. */
function QrUpload({ form }: { form: UseFormReturn<PaymentConfigForm> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const qrUrl = useWatch({ control: form.control, name: "qr_code_url" });

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { qr_code_url } = await uploadPaymentQrCode(file);
      form.setValue("qr_code_url", qr_code_url, { shouldDirty: true });
      toast.success("QR code uploaded — remember to save");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[7px] border border-dashed border-strong bg-card p-3">
      <div className="flex items-center gap-2.5">
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local-disk upload, not an optimizable remote asset
          <img src={qrUrl} alt="Merchant QR code" className="size-10 shrink-0 rounded-md border border-line object-cover" />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-app text-mute">
            <QrCode size={18} />
          </span>
        )}
        <div>
          <b className="text-[10px] text-ink">Static merchant QR code</b>
          <p className="mt-[5px] text-[10px] text-mute">{qrUrl ? "Printed at the counter." : "Upload the code your wallet provider issued you."}</p>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleQrUpload} />
      <Button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="min-h-[30px] gap-1.5 rounded-[7px] border border-line bg-card px-2.5 text-[11px] font-semibold text-ink hover:border-strong hover:bg-app disabled:opacity-60"
      >
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  );
}

function TextInput({ field, id, invalid, placeholder }: { field: React.ComponentProps<"input">; id: string; invalid: boolean; placeholder?: string }) {
  return <input {...field} id={id} placeholder={placeholder} aria-invalid={invalid} className={settingsInput} />;
}

export function PaymentsTab() {
  const { form, loading, lastSaved, onSave, saving } = useSettingsForm<PaymentConfigForm>({
    resolver: zodResolver(paymentConfigSchema) as Resolver<PaymentConfigForm>,
    defaults: EMPTY,
    noun: "payment settings",
    load: async () => toForm(await getPaymentConfig()),
    save: async (v) => toForm(await updatePaymentConfig(toRequest(v))),
  });
  const { control } = form;
  const bankOn = useWatch({ control, name: "bank_transfer_enabled" });
  const qrOn = useWatch({ control, name: "qr_wallet_enabled" });

  if (loading) return <SettingsLoading text="Loading payment settings…" />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Payments & tax</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">
            How patients pay you at checkout and how tax is applied. For your own OpthalmOK subscription, see{" "}
            <span className="font-semibold text-mute">Billing & subscription</span>.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-warn-soft text-warn-ink">
          <CreditCard size={18} />
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-mute">Tax registration</span>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <SettingsField control={control} name="tax_label" label="Tax label">
            {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} />}
          </SettingsField>
          <SettingsField control={control} name="tax_rate" label="Tax rate (%)">
            {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. 13" />}
          </SettingsField>
          <SettingsField control={control} name="vat_registration_no" label="VAT registration number">
            {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. 600123456" />}
          </SettingsField>
          <SettingsField control={control} name="pan_number" label="PAN number">
            {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. 301234567" />}
          </SettingsField>
        </div>
        <p className="-mt-1 text-[9px] text-mute">
          Shown on invoices and receipts where required by local tax authorities.
        </p>

        <div className="my-1 h-px bg-line" />

        <span className="text-[10px] font-semibold text-mute">Accepted payment methods</span>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
              <Banknote size={16} />
            </span>
            <b className="text-[11px] text-ink">Cash</b>
          </div>
          <ToggleField control={control} name="cash_enabled" label="Toggle cash" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
              <CreditCard size={16} />
            </span>
            <b className="text-[11px] text-ink">Card</b>
          </div>
          <ToggleField control={control} name="card_enabled" label="Toggle card" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
              <Landmark size={16} />
            </span>
            <b className="text-[11px] text-ink">Bank transfer</b>
          </div>
          <ToggleField control={control} name="bank_transfer_enabled" label="Toggle bank transfer" />
        </div>
        {bankOn && (
          <div className="ml-[44px] grid grid-cols-1 gap-[13px] rounded-[9px] border border-line bg-app p-3.5 sm:grid-cols-2">
            <SettingsField control={control} name="bank_name" label="Bank name">
              {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} />}
            </SettingsField>
            <SettingsField control={control} name="bank_account_holder" label="Account holder name">
              {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} />}
            </SettingsField>
            <SettingsField control={control} name="bank_account_number" label="Account number">
              {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. 01234567890123" />}
            </SettingsField>
            <SettingsField control={control} name="bank_branch" label="Branch">
              {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. New Baneshwor" />}
            </SettingsField>
            <SettingsField control={control} name="bank_swift_code" label="SWIFT / routing code (optional)" className="col-span-full">
              {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. NIMBNPKA" />}
            </SettingsField>
          </div>
        )}

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
              <QrCode size={16} />
            </span>
            <div>
              <b className="text-[11px] text-ink">Digital wallet / QR payment</b>
              <p className="mt-[5px] text-[10px] text-mute">Let patients scan to pay at the POS counter.</p>
            </div>
          </div>
          <ToggleField control={control} name="qr_wallet_enabled" label="Toggle QR wallet payment" />
        </div>
        {qrOn && (
          <div className="ml-[44px] flex flex-col gap-[13px] rounded-[9px] border border-line bg-app p-3.5">
            <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
              <SettingsField control={control} name="qr_wallet_provider" label="Wallet provider">
                {({ field, id, invalid }) => (
                  <NativeSelect {...field} id={id} aria-invalid={invalid} className={settingsInput}>
                    <option>eSewa</option>
                    <option>Khalti</option>
                    <option>FonePay</option>
                    <option>Other</option>
                  </NativeSelect>
                )}
              </SettingsField>
              <SettingsField control={control} name="qr_wallet_merchant_id" label="Merchant ID">
                {({ field, id, invalid }) => <TextInput field={field} id={id} invalid={invalid} placeholder="e.g. EPAYTEST-0098" />}
              </SettingsField>
            </div>
            <QrUpload form={form} />
          </div>
        )}

        <SaveRow onSave={onSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </form>
  );
}

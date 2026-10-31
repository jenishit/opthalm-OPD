"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, Loader2, QrCode, Upload } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";
import { getPaymentConfig, updatePaymentConfig, uploadPaymentQrCode } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicPaymentConfig } from "@/types/clinic-types";

const fieldClass =
  "min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]";
const labelClass = "flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]";

export function PaymentsTab() {
  const [config, setConfig] = useState<ClinicPaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getPaymentConfig()
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch((error) => {
        console.error("Failed to load payment config", error);
        toast.error("Failed to load payment settings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof ClinicPaymentConfig>(key: K, value: ClinicPaymentConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const saved = await updatePaymentConfig(config);
      setConfig(saved);
      setLastSaved(new Date().toISOString());
      toast.success("Payment settings saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { qr_code_url } = await uploadPaymentQrCode(file);
      set("qr_code_url", qr_code_url);
      toast.success("QR code uploaded — remember to save");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
        <Loader2 size={15} className="animate-spin" /> Loading payment settings…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Payments & tax</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">
            How patients pay you at checkout and how tax is applied. For your own OpthalmOK subscription, see{" "}
            <span className="font-semibold text-[#687468]">Billing & subscription</span>.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#f7efdf] text-[#a47a35]">
          <CreditCard size={18} />
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Tax registration</span>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className={labelClass}>
            Tax label
            <input value={config.tax_label ?? ""} onChange={(e) => set("tax_label", e.target.value)} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Tax rate
            <input value={config.tax_rate ?? ""} onChange={(e) => set("tax_rate", e.target.value)} className={fieldClass} />
          </label>
          <label className={labelClass}>
            VAT registration number
            <input
              value={config.vat_registration_no ?? ""}
              onChange={(e) => set("vat_registration_no", e.target.value)}
              placeholder="e.g. 600123456"
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            PAN number
            <input
              value={config.pan_number ?? ""}
              onChange={(e) => set("pan_number", e.target.value)}
              placeholder="e.g. 301234567"
              className={fieldClass}
            />
          </label>
        </div>
        <p className="-mt-1 text-[9px] text-[#a0a399]">
          Shown on invoices and receipts where required by local tax authorities.
        </p>

        <div className="my-1 h-px bg-[#eeece4]" />

        <span className="text-[10px] font-semibold text-[#687468]">Accepted payment methods</span>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <Banknote size={16} />
            </span>
            <b className="text-[11px] text-[#23342c]">Cash</b>
          </div>
          <Toggle on={config.cash_enabled} onToggle={(v) => set("cash_enabled", v)} label="Toggle cash" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <CreditCard size={16} />
            </span>
            <b className="text-[11px] text-[#23342c]">Card</b>
          </div>
          <Toggle on={config.card_enabled} onToggle={(v) => set("card_enabled", v)} label="Toggle card" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <Landmark size={16} />
            </span>
            <b className="text-[11px] text-[#23342c]">Bank transfer</b>
          </div>
          <Toggle
            on={config.bank_transfer_enabled}
            onToggle={(v) => set("bank_transfer_enabled", v)}
            label="Toggle bank transfer"
          />
        </div>
        {config.bank_transfer_enabled && (
          <div className="ml-[44px] grid grid-cols-1 gap-[13px] rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Bank name
              <input value={config.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value)} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Account holder name
              <input
                value={config.bank_account_holder ?? ""}
                onChange={(e) => set("bank_account_holder", e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Account number
              <input
                value={config.bank_account_number ?? ""}
                onChange={(e) => set("bank_account_number", e.target.value)}
                placeholder="e.g. 01234567890123"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Branch
              <input
                value={config.bank_branch ?? ""}
                onChange={(e) => set("bank_branch", e.target.value)}
                placeholder="e.g. New Baneshwor"
                className={fieldClass}
              />
            </label>
            <label className={"col-span-full " + labelClass}>
              SWIFT / routing code (optional)
              <input
                value={config.bank_swift_code ?? ""}
                onChange={(e) => set("bank_swift_code", e.target.value)}
                placeholder="e.g. NIMBNPKA"
                className={fieldClass}
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <QrCode size={16} />
            </span>
            <div>
              <b className="text-[11px] text-[#23342c]">Digital wallet / QR payment</b>
              <p className="mt-[5px] text-[10px] text-[#92988c]">Let patients scan to pay at the POS counter.</p>
            </div>
          </div>
          <Toggle on={config.qr_wallet_enabled} onToggle={(v) => set("qr_wallet_enabled", v)} label="Toggle QR wallet payment" />
        </div>
        {config.qr_wallet_enabled && (
          <div className="ml-[44px] flex flex-col gap-[13px] rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-3.5">
            <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
              <label className={labelClass}>
                Wallet provider
                <select
                  value={config.qr_wallet_provider ?? "eSewa"}
                  onChange={(e) => set("qr_wallet_provider", e.target.value)}
                  className={fieldClass}
                >
                  <option>eSewa</option>
                  <option>Khalti</option>
                  <option>FonePay</option>
                  <option>Other</option>
                </select>
              </label>
              <label className={labelClass}>
                Merchant ID
                <input
                  value={config.qr_wallet_merchant_id ?? ""}
                  onChange={(e) => set("qr_wallet_merchant_id", e.target.value)}
                  placeholder="e.g. EPAYTEST-0098"
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[7px] border border-dashed border-[#d9d5c8] bg-[#fffefa] p-3">
              <div className="flex items-center gap-2.5">
                {config.qr_code_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local-disk upload, not an optimizable remote asset
                  <img
                    src={config.qr_code_url}
                    alt="Merchant QR code"
                    className="size-10 shrink-0 rounded-md border border-[#e9e6dc] object-cover"
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#e9e6dc] bg-[#f6f5ef] text-[#92988c]">
                    <QrCode size={18} />
                  </span>
                )}
                <div>
                  <b className="text-[10px] text-[#23342c]">Static merchant QR code</b>
                  <p className="mt-[5px] text-[10px] text-[#92988c]">
                    {config.qr_code_url ? "Printed at the counter." : "Upload the code your wallet provider issued you."}
                  </p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleQrUpload} />
              <Button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[30px] gap-1.5 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec] disabled:opacity-60"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        )}

        <SaveRow onSave={handleSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </>
  );
}

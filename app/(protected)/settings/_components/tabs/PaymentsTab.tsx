"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Banknote, Landmark, QrCode, Upload } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";

const fieldClass =
  "min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]";
const labelClass = "flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]";

export function PaymentsTab() {
  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(true);
  const [qrWallet, setQrWallet] = useState(false);

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
            <input defaultValue="VAT" className={fieldClass} />
          </label>
          <label className={labelClass}>
            Tax rate
            <input defaultValue="13%" className={fieldClass} />
          </label>
          <label className={labelClass}>
            VAT registration number
            <input placeholder="e.g. 600123456" className={fieldClass} />
          </label>
          <label className={labelClass}>
            PAN number
            <input placeholder="e.g. 301234567" className={fieldClass} />
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
          <Toggle on={cash} onToggle={setCash} label="Toggle cash" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <CreditCard size={16} />
            </span>
            <b className="text-[11px] text-[#23342c]">Card</b>
          </div>
          <Toggle on={card} onToggle={setCard} label="Toggle card" />
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
              <Landmark size={16} />
            </span>
            <b className="text-[11px] text-[#23342c]">Bank transfer</b>
          </div>
          <Toggle on={bankTransfer} onToggle={setBankTransfer} label="Toggle bank transfer" />
        </div>
        {bankTransfer && (
          <div className="ml-[44px] grid grid-cols-1 gap-[13px] rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Bank name
              <input defaultValue="Nepal Investment Mega Bank" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Account holder name
              <input defaultValue="ClearView Eye Clinic & Optical" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Account number
              <input placeholder="e.g. 01234567890123" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Branch
              <input placeholder="e.g. New Baneshwor" className={fieldClass} />
            </label>
            <label className={"col-span-full " + labelClass}>
              SWIFT / routing code (optional)
              <input placeholder="e.g. NIMBNPKA" className={fieldClass} />
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
          <Toggle on={qrWallet} onToggle={setQrWallet} label="Toggle QR wallet payment" />
        </div>
        {qrWallet && (
          <div className="ml-[44px] flex flex-col gap-[13px] rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-3.5">
            <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
              <label className={labelClass}>
                Wallet provider
                <select className={fieldClass} defaultValue="eSewa">
                  <option>eSewa</option>
                  <option>Khalti</option>
                  <option>FonePay</option>
                  <option>Other</option>
                </select>
              </label>
              <label className={labelClass}>
                Merchant ID
                <input placeholder="e.g. EPAYTEST-0098" className={fieldClass} />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[7px] border border-dashed border-[#d9d5c8] bg-[#fffefa] p-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#e9e6dc] bg-[#f6f5ef] text-[#92988c]">
                  <QrCode size={18} />
                </span>
                <div>
                  <b className="text-[10px] text-[#23342c]">Static merchant QR code</b>
                  <p className="mt-[5px] text-[10px] text-[#92988c]">Printed at the counter — generated from your merchant ID.</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => toast.info("QR code uploaded")}
                className="min-h-[30px] gap-1.5 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
              >
                <Upload size={13} />
                Upload
              </Button>
            </div>
          </div>
        )}

        <SaveRow onSave={() => toast.info("Payment settings saved")} />
      </div>
    </>
  );
}

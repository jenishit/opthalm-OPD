"use client";

import { toast } from "sonner";
import { Wallet, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/shadcn/button";

const USAGE = [
  { label: "Staff seats", used: 7, limit: 10, color: "#3c7652" },
  { label: "Patient records", used: 2481, limit: 5000, color: "#779ba7" },
  { label: "Locations", used: 2, limit: 3, color: "#bd9652" },
];

const INVOICES = [
  { id: "INV-2026-0010", date: "1 Oct 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-0009", date: "1 Sep 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-0008", date: "1 Aug 2026", amount: "$149.00", status: "Paid" },
];

export function BillingTab() {
  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Billing & subscription</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">
            Manage ClearView&apos;s OpthalmOK plan, usage, and payment details.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
          <Wallet size={18} />
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-[15px]">
        <div>
          <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-[#e9f0e8] px-[7px] py-1 text-[9px] font-semibold leading-none text-[#214c3a]">
            GROWTH PLAN
          </span>
          <div className="mt-2 font-['Manrope',sans-serif] text-[20px] font-semibold text-[#23342c]">
            $149.00 <span className="text-[11px] font-normal text-[#92988c]">/ month</span>
          </div>
          <p className="mt-1 text-[10px] text-[#92988c]">Next invoice on 1 Nov 2026 · auto-renews</p>
        </div>
        <Button
          onClick={() => toast.info("Plan comparison opened")}
          className="min-h-9 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
        >
          Change plan
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Plan usage</span>
        {USAGE.map((u) => (
          <div key={u.label}>
            <div className="mb-[9px] flex items-center justify-between">
              <span className="text-[10px] text-[#7f887c]">{u.label}</span>
              <b className="text-[11px] text-[#23342c]">
                {u.used.toLocaleString()} <span className="font-normal text-[#92988c]">/ {u.limit.toLocaleString()}</span>
              </b>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[5px] bg-[#eeece4]">
              <span
                className="block h-full rounded-[5px]"
                style={{ width: Math.min(100, (u.used / u.limit) * 100) + "%", backgroundColor: u.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="my-1 h-px bg-[#eeece4]" />

      <div className="flex items-center justify-between gap-[15px] py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e8f0f2] text-[#557d8b]">
            <CreditCard size={16} />
          </span>
          <div>
            <b className="text-[11px] text-[#23342c]">Visa ending in 4242</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Expires 08/28 · used for your OpthalmOK subscription</p>
          </div>
        </div>
        <Button
          onClick={() => toast.info("Payment method update opened")}
          className="min-h-[30px] rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          Update
        </Button>
      </div>

      <div className="my-1 h-px bg-[#eeece4]" />

      <div className="py-3">
        <span className="mb-2 block text-[10px] font-semibold text-[#687468]">Invoice history</span>
        <div className="flex flex-col">
          {INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 border-t border-[#efede6] py-2.5 first:border-t-0">
              <div className="flex flex-col gap-0.5">
                <b className="font-mono text-[10px] text-[#23342c]">{inv.id}</b>
                <span className="text-[9px] text-[#92988c]">{inv.date}</span>
              </div>
              <span className="text-[10px] text-[#697368]">{inv.amount}</span>
              <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-[#e7efe6] px-[7px] py-1 text-[9px] font-semibold leading-none text-[#3e7350]">
                <i className="size-[5px] rounded-full bg-current opacity-80" />
                {inv.status}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => toast.info(`${inv.id} downloaded`)}
                className="size-[27px] rounded-md text-[#858b82] hover:bg-[#f1f0e9] hover:text-[#214c3a]"
              >
                <Download size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#eeece4] pt-[17px]">
        <span className="text-[9px] text-[#a0a399]">Questions about your plan? Contact billing support.</span>
        <Button
          onClick={() => toast.info("Cancellation flow opened")}
          className="min-h-9 rounded-[7px] border border-[#f0d9d3] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#a66b62] hover:border-[#e3b8ae] hover:bg-[#f5e7e3]"
        >
          Cancel subscription
        </Button>
      </div>
    </>
  );
}

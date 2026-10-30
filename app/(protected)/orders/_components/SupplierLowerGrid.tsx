"use client";

import { toast } from "sonner";
import { CalendarDays, ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";

const DELIVERIES = [
  { day: "29", month: "MAY", name: "Essilor Australia", detail: "50 lenses · LS-0087", status: "In transit" },
  { day: "02", month: "JUN", name: "Hoya Lens", detail: "40 lenses · LS-0085", status: "Awaiting confirmation" },
];

function notify(message: string) {
  toast.info(message);
}

export function SupplierLowerGrid() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
        <div className="flex items-center justify-between gap-3 px-5 pb-[14px] pt-[19px]">
          <div>
            <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Expected deliveries</h3>
            <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Upcoming supplier arrivals</p>
          </div>
          <CalendarDays size={17} className="text-[#969a90]" />
        </div>
        {DELIVERIES.map((d, i) => (
          <div
            key={d.name}
            className={"flex items-center gap-3 px-5 py-3 " + (i > 0 ? "border-t border-[#efede6]" : "")}
          >
            <div className="flex h-[46px] w-[42px] flex-col items-center justify-center gap-0.5 rounded-lg border border-[#e9e6dc] bg-[#fbfaf6]">
              <b className="font-['Manrope',sans-serif] text-[17px]">{d.day}</b>
              <span className="text-[8px] tracking-[1px] text-[#92988c]">{d.month}</span>
            </div>
            <div className="flex flex-1 flex-col gap-[5px]">
              <b className="text-[11px] text-[#23342c]">{d.name}</b>
              <span className="text-[9px] text-[#969a91]">{d.detail}</span>
            </div>
            <span
              className={
                "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                (d.status === "In transit" ? "bg-[#e6eff2] text-[#527d8a]" : "bg-[#f7efd9] text-[#9d7832]")
              }
            >
              <i className="size-[5px] rounded-full bg-current opacity-80" />
              {d.status}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-5 shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
        <span className="grid size-[34px] place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
          <ClipboardList size={18} />
        </span>
        <h3 className="mb-[7px] mt-[14px] font-['Playfair_Display',serif] text-base font-semibold text-[#23342c]">
          Purchasing insight
        </h3>
        <p className="mb-[17px] text-[10px] leading-[1.7] text-[#858d81]">
          4 product lines are below their reorder point. Consider combining your next lens order to meet supplier
          minimums and reduce delivery costs.
        </p>
        <Button
          onClick={() => notify("Reorder suggestions prepared")}
          className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          Review reorder suggestions <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { toast } from "sonner";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";

const STEPS = [
  { n: "01", label: "Prescription", count: 4, bg: "bg-[#e7efe6]", text: "text-[#487653]" },
  { n: "02", label: "Lens ordered", count: 6, bg: "bg-[#e6eff2]", text: "text-[#628997]" },
  { n: "03", label: "In production", count: 9, bg: "bg-[#f7efd9]", text: "text-[#a17a38]" },
  { n: "04", label: "Fitting", count: 3, bg: "bg-[#eee9f4]", text: "text-[#83729b]" },
  { n: "05", label: "Ready to collect", count: 6, bg: "bg-[#e7efe6]", text: "text-[#487653]" },
];

export function FulfilmentOverview() {
  return (
    <div className="mt-[17px] rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex items-center justify-between gap-3 px-5 pb-[14px] pt-[19px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Fulfilment overview</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Where active orders are in the journey</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => toast.info("Fulfilment board opened")}
          className="h-auto gap-[5px] border-0 p-0 text-[10px] font-bold text-[#2e644b] hover:bg-transparent hover:text-[#142e22]"
        >
          Open board <ArrowRight size={14} />
        </Button>
      </div>
      <div className="grid grid-cols-5 px-5 pb-5 pt-[5px]">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={"flex items-center gap-[9px] px-2 py-2.5 " + (i < STEPS.length - 1 ? "border-r border-[#eeece4]" : "")}
          >
            <span className={"grid size-[31px] shrink-0 place-items-center rounded-[9px] text-[10px] font-bold " + s.bg + " " + s.text}>
              {s.n}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <b className="text-[10px] text-[#23342c]">{s.label}</b>
              <span className="text-[9px] text-[#969a91]">{s.count} orders</span>
            </div>
            <ChevronRight size={15} className="shrink-0 text-[#b1b5aa]" />
          </div>
        ))}
      </div>
    </div>
  );
}

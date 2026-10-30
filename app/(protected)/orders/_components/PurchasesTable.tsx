"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { MOCK_SUPPLIERS } from "./mock-data";

function notify(message: string) {
  toast.info(message);
}

const STATUS_STYLE: Record<string, string> = {
  Delivered: "bg-[#e7efe6] text-[#3e7350]",
  "In transit": "bg-[#e6eff2] text-[#527d8a]",
};
const STATUS_FALLBACK = "bg-[#f7efd9] text-[#9d7832]";

const TABS = ["All orders", "Pending", "In transit", "Delivered"];

export function PurchasesTable() {
  const [orderTab, setOrderTab] = useState("All orders");

  const filtered = MOCK_SUPPLIERS.filter(
    (s) => orderTab === "All orders" || s.status.toLowerCase() === orderTab.toLowerCase()
  );

  return (
    <div className="overflow-hidden rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeece4] px-[18px] py-4">
        <div className="flex flex-wrap gap-[3px] rounded-lg bg-[#f3f2eb] p-[3px]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setOrderTab(t)}
              className={
                "whitespace-nowrap rounded-md px-3 py-2 text-[10px] " +
                (orderTab === t
                  ? "bg-[#fffefa] font-bold text-[#2d5b40] shadow-[0_1px_3px_#dfded4]"
                  : "text-[#82887e]")
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 min-w-[215px] items-center gap-2 rounded-lg border border-[#e9e6dc] bg-[#fffefa] px-2.5 text-[#9a9d94]">
            <Search size={14} />
            <input
              placeholder="Search supplier or order ID…"
              className="w-full bg-transparent text-[11px] text-[#23342c] outline-none placeholder:text-[#a4a69e]"
            />
          </div>
          <Button
            onClick={() => notify("Supplier orders exported")}
            className="min-h-9 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left">
          <thead className="bg-[#faf9f4]">
            <tr>
              {["PURCHASE ORDER", "SUPPLIER / LAB", "ITEMS", "STATUS", "EXPECTED DATE", "TOTAL", ""].map((h) => (
                <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-[#969a90]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#fcfbf7]">
                <td className="border-t border-[#f0eee7] px-[17px] py-3 font-mono text-[10px] text-[#6c786b]">{s.id}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <div className="flex items-center gap-[9px]">
                    <span className="grid size-[33px] shrink-0 place-items-center rounded-lg border border-[#e7e5dc] bg-[#f5f3eb] text-[10px] font-bold text-[#4b7053]">
                      {s.supplier
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div className="flex flex-col gap-1">
                      <b className="text-[10px] text-[#435246]">{s.supplier}</b>
                      <span className="text-[9px] text-[#999d93]">Optical lens supplier</span>
                    </div>
                  </div>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{s.items}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <span
                    className={
                      "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                      (STATUS_STYLE[s.status] ?? STATUS_FALLBACK)
                    }
                  >
                    <i className="size-[5px] rounded-full bg-current opacity-80" />
                    {s.status}
                  </span>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{s.date}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] font-bold text-[#3f5544]">{s.total}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => notify("Supplier order details")}
                    className="size-[31px] rounded-lg text-[#858b82] hover:bg-[#f1f0e9] hover:text-[#214c3a]"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eeece4] px-[18px] py-[13px] text-[10px] text-[#969a90]">
        <span>Showing {filtered.length} of 12 purchase orders</span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]">
            <ChevronLeft size={15} />
          </Button>
          <Button size="icon" className="size-[27px] rounded-md border-[#214c3a] bg-[#214c3a] text-white">
            1
          </Button>
          <Button size="icon" variant="outline" className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]">
            2
          </Button>
          <Button size="icon" variant="outline" className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]">
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}

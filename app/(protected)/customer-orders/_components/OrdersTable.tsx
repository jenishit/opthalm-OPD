"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { MOCK_ORDERS } from "./mock-data";

function notify(message: string) {
  toast.info(message);
}

const STATUS_STYLE: Record<string, string> = {
  Delivered: "bg-[#e7efe6] text-[#3e7350]",
  "Ready for pickup": "bg-[#e6eff2] text-[#527d8a]",
  Fitting: "bg-[#eee9f4] text-[#7e6d98]",
};
const STATUS_FALLBACK = "bg-[#f7efd9] text-[#9d7832]";

const TABS = ["All orders", "Spectacles", "Lens orders", "Sunglasses"];

export function OrdersTable() {
  const [orderTab, setOrderTab] = useState("All orders");

  const filtered = MOCK_ORDERS.filter(
    (o) =>
      orderTab === "All orders" ||
      (orderTab === "Spectacles"
        ? o.item.toLowerCase().includes("spectacle")
        : orderTab === "Lens orders"
          ? o.item.toLowerCase().includes("lens")
          : o.item.toLowerCase().includes("sunglasses"))
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
              placeholder="Search order, patient or frame…"
              className="w-full bg-transparent text-[11px] text-[#23342c] outline-none placeholder:text-[#a4a69e]"
            />
          </div>
          <Button
            onClick={() => notify("Order filters opened")}
            className="min-h-9 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <Filter size={14} />
            Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left">
          <thead className="bg-[#faf9f4]">
            <tr>
              {["ORDER", "PATIENT", "ORDER TYPE", "STATUS", "EXPECTED DATE", "TOTAL", ""].map((h) => (
                <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-[#969a90]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-[#fcfbf7]">
                <td className="border-t border-[#f0eee7] px-[17px] py-3 font-mono text-[10px] text-[#6c786b]">{o.id}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <div className="flex items-center gap-[9px]">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e2ece2] text-[10px] font-bold text-[#37674a]">
                      {o.patient
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </span>
                    <b className="text-[10px] text-[#23342c]">{o.patient}</b>
                  </div>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{o.item}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <span
                    className={
                      "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                      (STATUS_STYLE[o.status] ?? STATUS_FALLBACK)
                    }
                  >
                    <i className="size-[5px] rounded-full bg-current opacity-80" />
                    {o.status}
                  </span>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{o.date}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] font-bold text-[#3f5544]">{o.total}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => notify("Order details")}
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
        <span>Showing 4 of 28 active orders</span>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button size="icon" className="size-[27px] rounded-md border-[#214c3a] bg-[#214c3a] text-white">
            1
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]"
          >
            2
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]"
          >
            3
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-[27px] rounded-md border-[#e9e6dc] bg-[#fffefa] text-[#788076]"
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}

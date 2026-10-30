"use client";

import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";

const ITEMS = [
  { title: "Email notifications", desc: "Daily summary and important account updates by email.", on: true },
  { title: "SMS appointment reminders", desc: "Text patients 24 hours before their scheduled visit.", on: true },
  { title: "Low-stock alerts", desc: "Alert the optical manager when a product nears its reorder point.", on: true },
  { title: "New order notifications", desc: "Notify staff when a customer or supplier order is created.", on: false },
  { title: "Weekly performance digest", desc: "A Monday morning summary of sales and clinical activity.", on: false },
];

export function NotificationsTab() {
  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Notifications</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Choose what your team gets notified about, and how.</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e8f0f2] text-[#557d8b]">
          <Bell size={18} />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {ITEMS.map((n) => (
          <div key={n.title} className="flex items-center justify-between gap-[15px] py-1">
            <div>
              <b className="text-[11px] text-[#23342c]">{n.title}</b>
              <p className="mt-[5px] text-[10px] text-[#92988c]">{n.desc}</p>
            </div>
            <Toggle defaultOn={n.on} label={`Toggle ${n.title}`} />
          </div>
        ))}
        <SaveRow onSave={() => toast.info("Notification preferences saved")} />
      </div>
    </>
  );
}

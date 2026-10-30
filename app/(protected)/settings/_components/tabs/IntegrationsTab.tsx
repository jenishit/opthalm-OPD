"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plug, CalendarClock, MessageSquare, Receipt, Truck } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { LucideIcon } from "lucide-react";

interface Integration {
  name: string;
  desc: string;
  icon: LucideIcon;
  connected: boolean;
}

const INITIAL: Integration[] = [
  { name: "Xero", desc: "Sync invoices and expenses with your accounting ledger.", icon: Receipt, connected: true },
  { name: "Twilio", desc: "Send SMS appointment reminders and order updates to patients.", icon: MessageSquare, connected: true },
  { name: "Google Calendar", desc: "Two-way sync of appointments with staff calendars.", icon: CalendarClock, connected: false },
  { name: "Essilor Connect", desc: "Place and track lens orders directly with your lab.", icon: Truck, connected: false },
];

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState(INITIAL);

  function toggle(name: string) {
    setIntegrations((list) =>
      list.map((i) => {
        if (i.name !== name) return i;
        toast.info(i.connected ? `${name} disconnected` : `${name} connected`);
        return { ...i, connected: !i.connected };
      })
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Integrations</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Connect ClearView to the tools you already use.</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#f0edf6] text-[#8477a3]">
          <Plug size={18} />
        </span>
      </div>
      <div className="flex flex-col">
        {integrations.map((i) => (
          <div key={i.name} className="flex items-center justify-between gap-3 border-t border-[#efede6] py-3.5 first:border-t-0">
            <div className="flex items-center gap-2.5">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
                <i.icon size={16} />
              </span>
              <div>
                <b className="text-[11px] text-[#23342c]">{i.name}</b>
                <p className="mt-[5px] text-[10px] text-[#92988c]">{i.desc}</p>
              </div>
            </div>
            <Button
              onClick={() => toggle(i.name)}
              className={
                "min-h-[30px] rounded-[7px] px-2.5 text-[11px] font-semibold " +
                (i.connected
                  ? "border border-[#e2dfd5] bg-[#fffefa] text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
                  : "border border-[#214c3a] bg-[#214c3a] text-white hover:border-[#173d2c] hover:bg-[#173d2c]")
              }
            >
              {i.connected ? "Connected" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] leading-[1.6] text-[#92988c]">
        Looking for something else?{" "}
        <button onClick={() => toast.info("Integration request form opened")} className="font-semibold text-[#2e644b] hover:text-[#142e22]">
          Request an integration
        </button>
        .
      </p>
    </>
  );
}

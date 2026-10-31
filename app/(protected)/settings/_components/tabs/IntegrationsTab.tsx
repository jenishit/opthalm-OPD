"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2, MessageSquare, Plug, Receipt, Truck } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { LucideIcon } from "lucide-react";
import { connectIntegration, disconnectIntegration, listIntegrations } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicIntegration, ClinicIntegrationProvider } from "@/types/clinic-types";

const PROVIDER_INFO: Record<ClinicIntegrationProvider, { name: string; desc: string; icon: LucideIcon }> = {
  xero: { name: "Xero", desc: "Sync invoices and expenses with your accounting ledger.", icon: Receipt },
  twilio: { name: "Twilio", desc: "Send SMS appointment reminders and order updates to patients.", icon: MessageSquare },
  google_calendar: { name: "Google Calendar", desc: "Two-way sync of appointments with staff calendars.", icon: CalendarClock },
  essilor_connect: { name: "Essilor Connect", desc: "Place and track lens orders directly with your lab.", icon: Truck },
};

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<ClinicIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<ClinicIntegrationProvider | null>(null);

  useEffect(() => {
    let active = true;
    listIntegrations()
      .then((data) => {
        if (active) setIntegrations(data);
      })
      .catch((error) => {
        console.error("Failed to load integrations", error);
        toast.error("Failed to load integrations");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggle(integration: ClinicIntegration) {
    const { provider, connected } = integration;
    const name = PROVIDER_INFO[provider].name;
    setPending(provider);
    try {
      if (connected) {
        await disconnectIntegration(provider);
        setIntegrations((list) => list.map((i) => (i.provider === provider ? { ...i, connected: false } : i)));
        toast.info(`${name} disconnected`);
      } else {
        const updated = await connectIntegration(provider);
        setIntegrations((list) => list.map((i) => (i.provider === provider ? updated : i)));
        toast.success(`${name} connected`);
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : `Failed to update ${name}`);
    } finally {
      setPending(null);
    }
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
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
          <Loader2 size={15} className="animate-spin" /> Loading integrations…
        </div>
      ) : (
        <div className="flex flex-col">
          {integrations.map((i) => {
            const info = PROVIDER_INFO[i.provider];
            const Icon = info.icon;
            const busy = pending === i.provider;
            return (
              <div key={i.provider} className="flex items-center justify-between gap-3 border-t border-[#efede6] py-3.5 first:border-t-0">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
                    <Icon size={16} />
                  </span>
                  <div>
                    <b className="text-[11px] text-[#23342c]">{info.name}</b>
                    <p className="mt-[5px] text-[10px] text-[#92988c]">{info.desc}</p>
                  </div>
                </div>
                <Button
                  disabled={busy}
                  onClick={() => toggle(i)}
                  className={
                    "min-h-[30px] gap-1.5 rounded-[7px] px-2.5 text-[11px] font-semibold disabled:opacity-60 " +
                    (i.connected
                      ? "border border-[#e2dfd5] bg-[#fffefa] text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
                      : "border border-[#214c3a] bg-[#214c3a] text-white hover:border-[#173d2c] hover:bg-[#173d2c]")
                  }
                >
                  {busy && <Loader2 size={12} className="animate-spin" />}
                  {i.connected ? "Connected" : "Connect"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
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

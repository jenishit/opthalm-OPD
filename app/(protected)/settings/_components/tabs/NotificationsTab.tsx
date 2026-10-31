"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";
import { getClinic, getClinicNotifications, patchOwnClinic, updateClinicNotifications } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicNotifications } from "@/types/clinic-types";

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<ClinicNotifications | null>(null);
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getClinicNotifications(), getClinic()])
      .then(([n, clinic]) => {
        if (!active) return;
        setNotifications(n);
        setLowStock(clinic.low_stock_notifications ?? false);
      })
      .catch((error) => {
        console.error("Failed to load notification preferences", error);
        toast.error("Failed to load notification preferences");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof ClinicNotifications>(key: K, value: ClinicNotifications[K]) {
    setNotifications((n) => (n ? { ...n, [key]: value } : n));
  }

  async function handleSave() {
    if (!notifications) return;
    setSaving(true);
    try {
      await Promise.all([
        updateClinicNotifications(notifications),
        patchOwnClinic({ low_stock_notifications: lowStock }),
      ]);
      setLastSaved(new Date().toISOString());
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !notifications) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
        <Loader2 size={15} className="animate-spin" /> Loading notification preferences…
      </div>
    );
  }

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
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Email notifications</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Daily summary and important account updates by email.</p>
          </div>
          <Toggle
            on={notifications.email_notifications}
            onToggle={(v) => set("email_notifications", v)}
            label="Toggle email notifications"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">SMS appointment reminders</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Text patients 24 hours before their scheduled visit.</p>
          </div>
          <Toggle
            on={notifications.sms_appointment_reminders}
            onToggle={(v) => set("sms_appointment_reminders", v)}
            label="Toggle SMS appointment reminders"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Low-stock alerts</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Alert the optical manager when a product nears its reorder point.</p>
          </div>
          <Toggle on={lowStock} onToggle={setLowStock} label="Toggle low-stock alerts" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">New order notifications</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Notify staff when a customer or supplier order is created.</p>
          </div>
          <Toggle
            on={notifications.new_order_notifications}
            onToggle={(v) => set("new_order_notifications", v)}
            label="Toggle new order notifications"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Weekly performance digest</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">A Monday morning summary of sales and clinical activity.</p>
          </div>
          <Toggle
            on={notifications.weekly_performance_digest}
            onToggle={(v) => set("weekly_performance_digest", v)}
            label="Toggle weekly performance digest"
          />
        </div>
        <SaveRow onSave={handleSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </>
  );
}

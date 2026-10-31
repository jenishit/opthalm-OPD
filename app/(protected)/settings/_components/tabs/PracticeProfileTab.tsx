"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";
import { getClinic, updateClinic } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicResponse } from "@/types/clinic-types";

const CURRENCY_OPTIONS = [
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "NPR", label: "NPR — Nepalese Rupee" },
];

const TIMEZONE_OPTIONS = [
  { value: "Australia/Melbourne", label: "Australia / Melbourne" },
  { value: "Asia/Kathmandu", label: "Asia / Kathmandu" },
];

export function PracticeProfileTab() {
  const [clinic, setClinic] = useState<ClinicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getClinic()
      .then((data) => {
        if (active) setClinic(data);
      })
      .catch((error) => {
        console.error("Failed to load clinic profile", error);
        toast.error("Failed to load practice profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof ClinicResponse>(key: K, value: ClinicResponse[K]) {
    setClinic((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    if (!clinic) return;
    setSaving(true);
    try {
      await updateClinic(clinic.id, {
        clinic_name: clinic.clinic_name,
        registration_no: clinic.registration_no,
        tagline: clinic.tagline,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        report_footer: clinic.report_footer,
        workspace_slug: clinic.workspace_slug,
        default_currency: clinic.default_currency,
        timezone: clinic.timezone,
        require_consent_before_exam: clinic.require_consent_before_exam,
        low_stock_notifications: clinic.low_stock_notifications,
      });
      setLastSaved(new Date().toISOString());
      toast.success("Practice settings saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save practice settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !clinic) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
        <Loader2 size={15} className="animate-spin" /> Loading practice profile…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Practice profile</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">
            Clinic identity shown on prescriptions, receipts, and patient communications.
          </p>
        </div>
        <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-[#e9f0e8] px-[7px] py-1 text-[9px] font-semibold leading-none text-[#214c3a]">
          GROWTH PLAN
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-[15px]">
        <div className="grid size-[37px] shrink-0 place-items-center rounded-[13px] bg-[#214c3a] text-[#f3f4e8]">
          <Eye size={28} />
        </div>
        <div className="min-w-[160px] flex-1">
          <h2 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#23342c]">{clinic.clinic_name}</h2>
          <input
            value={clinic.tagline ?? ""}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="A short tagline shown under your clinic name"
            className="m-0 mt-[5px] w-full bg-transparent text-[10px] text-[#92988c] outline-none placeholder:text-[#c3c6bb]"
          />
        </div>
        <Button
          onClick={() => toast.info("Logo upload isn't wired up yet")}
          className="min-h-[30px] rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          Update logo
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Practice name
          <input
            value={clinic.clinic_name}
            onChange={(e) => set("clinic_name", e.target.value)}
            className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
          />
        </label>
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Workspace URL
          <div className="flex min-h-[37px] items-center gap-1.5 rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 text-[11px] text-[#4c5c4f] focus-within:border-[#72957c]">
            <Globe size={13} className="shrink-0 text-[#a0a399]" />
            <input
              value={clinic.workspace_slug ?? ""}
              onChange={(e) => set("workspace_slug", e.target.value)}
              className="w-20 bg-transparent outline-none"
            />
            <span className="text-[#a0a399]">.opthalmok.app</span>
          </div>
        </label>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Contact email
            <input
              value={clinic.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Phone number
            <input
              value={clinic.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
        </div>
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Practice address
          <input
            value={clinic.address ?? ""}
            onChange={(e) => set("address", e.target.value)}
            className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
          />
        </label>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Default currency
            <select
              value={clinic.default_currency ?? "AUD"}
              onChange={(e) => set("default_currency", e.target.value)}
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Time zone
            <select
              value={clinic.timezone ?? "Australia/Melbourne"}
              onChange={(e) => set("timezone", e.target.value)}
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Require patient consent before examination</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Staff must record consent before beginning a clinical examination.</p>
          </div>
          <Toggle
            on={clinic.require_consent_before_exam ?? false}
            onToggle={(next) => set("require_consent_before_exam", next)}
            label="Toggle consent"
          />
        </div>

        <SaveRow onSave={handleSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileDown, History, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";
import { getAuditLog, getPrivacyConfig, updatePrivacyConfig } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicAuditLogEntry, ClinicPrivacyConfig, ClinicRetentionPeriod } from "@/types/clinic-types";

const RETENTION_LABEL: Record<ClinicRetentionPeriod, string> = {
  "7_years": "7 years (recommended)",
  "10_years": "10 years",
  indefinite: "Indefinite",
};

function AuditLogDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [entries, setEntries] = useState<ClinicAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAuditLog()
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((error) => {
        console.error("Failed to load audit log", error);
        toast.error("Failed to load audit log");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Audit log</DialogTitle>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-[#92988c]">
            <Loader2 size={15} className="animate-spin" /> Loading audit log…
          </div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center text-[11px] text-[#92988c]">
            No activity recorded yet — nothing in the app writes to the audit log at the moment.
          </div>
        ) : (
          <div className="flex max-h-[360px] flex-col gap-2.5 overflow-auto">
            {entries.map((e) => (
              <div key={e.id} className="rounded-[7px] border border-[#e9e6dc] bg-[#fbfaf6] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[11px] text-[#23342c]">{e.actor_name}</b>
                  <span className="text-[9px] text-[#a0a399]">{new Date(e.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-[10px] text-[#687468]">
                  {e.action}
                  {e.target ? ` · ${e.target}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DataPrivacyTab() {
  const [config, setConfig] = useState<ClinicPrivacyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getPrivacyConfig()
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch((error) => {
        console.error("Failed to load privacy config", error);
        toast.error("Failed to load data & privacy settings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof ClinicPrivacyConfig>(key: K, value: ClinicPrivacyConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const saved = await updatePrivacyConfig(config);
      setConfig(saved);
      setLastSaved(new Date().toISOString());
      toast.success("Data & privacy settings saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save data & privacy settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
        <Loader2 size={15} className="animate-spin" /> Loading data & privacy settings…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Data & privacy</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">
            How ClearView protects patient data, meets compliance obligations, and controls staff access.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
          <ShieldCheck size={18} />
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Compliance</span>
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Patient record retention period
          <select
            value={config.retention_period}
            onChange={(e) => set("retention_period", e.target.value as ClinicRetentionPeriod)}
            className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c] sm:w-1/2"
          >
            {(Object.entries(RETENTION_LABEL) as [ClinicRetentionPeriod, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-anonymize records past retention period</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              Strip identifying details from records once the retention period has elapsed, instead of deleting them outright.
            </p>
          </div>
          <Toggle
            on={config.auto_anonymize_after_retention}
            onToggle={(v) => set("auto_anonymize_after_retention", v)}
            label="Toggle auto-anonymize"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Allow patients to request their data</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Patients can request a full export of their record from the patient portal.</p>
          </div>
          <Toggle
            on={config.allow_data_export_requests}
            onToggle={(v) => set("allow_data_export_requests", v)}
            label="Toggle data export requests"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Allow patients to request deletion</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              Patients can request erasure of their record, routed to your practice manager for review.
            </p>
          </div>
          <Toggle
            on={config.allow_deletion_requests}
            onToggle={(v) => set("allow_deletion_requests", v)}
            label="Toggle deletion requests"
          />
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <span className="text-[10px] font-semibold text-[#687468]">Staff access & sign-in</span>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Two-factor authentication</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Require a one-time code at sign-in for every staff account.</p>
          </div>
          <Toggle on={config.require_two_factor} onToggle={(v) => set("require_two_factor", v)} label="Toggle two-factor authentication" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Automatic session timeout</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Sign staff out after 30 minutes of inactivity on shared devices.</p>
          </div>
          <Toggle on={config.auto_session_timeout} onToggle={(v) => set("auto_session_timeout", v)} label="Toggle session timeout" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Login alerts</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Email the practice manager when a staff account signs in from a new device.</p>
          </div>
          <Toggle on={config.login_alerts} onToggle={(v) => set("login_alerts", v)} label="Toggle login alerts" />
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-3">
          <Button
            onClick={() => toast.info("Password change flow isn't wired up yet")}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <Lock size={14} />
            Change password
          </Button>
          <Button
            onClick={() => setAuditOpen(true)}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <History size={14} />
            View audit log
          </Button>
          <Button
            onClick={() => toast.info("Patient data export isn't wired up yet")}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <FileDown size={14} />
            Export all patient data
          </Button>
        </div>

        <SaveRow onSave={handleSave} saving={saving} lastSaved={lastSaved} />
      </div>

      <AuditLogDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </>
  );
}

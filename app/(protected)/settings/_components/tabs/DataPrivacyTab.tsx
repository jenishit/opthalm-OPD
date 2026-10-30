"use client";

import { toast } from "sonner";
import { ShieldCheck, Lock, History, FileDown } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";

export function DataPrivacyTab() {
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
          <select className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c] sm:w-1/2">
            <option>7 years (recommended)</option>
            <option>10 years</option>
            <option>Indefinite</option>
          </select>
        </label>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-anonymize records past retention period</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              Strip identifying details from records once the retention period has elapsed, instead of deleting them outright.
            </p>
          </div>
          <Toggle defaultOn label="Toggle auto-anonymize" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Allow patients to request their data</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Patients can request a full export of their record from the patient portal.</p>
          </div>
          <Toggle defaultOn label="Toggle data export requests" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Allow patients to request deletion</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              Patients can request erasure of their record, routed to your practice manager for review.
            </p>
          </div>
          <Toggle label="Toggle deletion requests" />
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <span className="text-[10px] font-semibold text-[#687468]">Staff access & sign-in</span>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Two-factor authentication</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Require a one-time code at sign-in for every staff account.</p>
          </div>
          <Toggle label="Toggle two-factor authentication" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Automatic session timeout</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Sign staff out after 30 minutes of inactivity on shared devices.</p>
          </div>
          <Toggle defaultOn label="Toggle session timeout" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Login alerts</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Email the practice manager when a staff account signs in from a new device.</p>
          </div>
          <Toggle label="Toggle login alerts" />
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-3">
          <Button
            onClick={() => toast.info("Password change flow opened")}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <Lock size={14} />
            Change password
          </Button>
          <Button
            onClick={() => toast.info("Audit log opened")}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <History size={14} />
            View audit log
          </Button>
          <Button
            onClick={() => toast.info("Patient data export prepared")}
            className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
          >
            <FileDown size={14} />
            Export all patient data
          </Button>
        </div>

        <SaveRow onSave={() => toast.info("Data & privacy settings saved")} />
      </div>
    </>
  );
}

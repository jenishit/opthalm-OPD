"use client";

import { toast } from "sonner";
import { Eye, Globe } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";

export function PracticeProfileTab() {
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
          <h2 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#23342c]">ClearView Eye Clinic & Optical</h2>
          <p className="m-0 mt-[5px] text-[10px] text-[#92988c]">Better vision, brighter lives.</p>
        </div>
        <Button
          onClick={() => toast.info("Logo upload selected")}
          className="min-h-[30px] rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          Update logo
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Practice name
          <input
            defaultValue="ClearView Eye Clinic & Optical"
            className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
          />
        </label>
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Workspace URL
          <div className="flex min-h-[37px] items-center gap-1.5 rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 text-[11px] text-[#4c5c4f] focus-within:border-[#72957c]">
            <Globe size={13} className="shrink-0 text-[#a0a399]" />
            <input
              defaultValue="clearview"
              className="w-20 bg-transparent outline-none"
            />
            <span className="text-[#a0a399]">.opthalmok.app</span>
          </div>
        </label>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Contact email
            <input
              defaultValue="hello@clearview.example"
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Phone number
            <input
              defaultValue="+61 3 9000 1234"
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
        </div>
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
          Practice address
          <input
            defaultValue="123 Main Street, Melbourne VIC 3000, Australia"
            className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
          />
        </label>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Default currency
            <select className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]">
              <option>AUD — Australian Dollar</option>
              <option>USD — US Dollar</option>
              <option>NPR — Nepalese Rupee</option>
            </select>
          </label>
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Time zone
            <select className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]">
              <option>Australia / Melbourne</option>
              <option>Asia / Kathmandu</option>
            </select>
          </label>
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Require patient consent before examination</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Staff must record consent before beginning a clinical examination.</p>
          </div>
          <Toggle defaultOn label="Toggle consent" />
        </div>

        <SaveRow onSave={() => toast.info("Practice settings saved")} />
      </div>
    </>
  );
}

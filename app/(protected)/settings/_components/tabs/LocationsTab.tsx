"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { SaveRow } from "../SaveRow";

interface Location {
  name: string;
  detail: string;
  rooms: number;
  status: "Active" | "Opening soon";
}

const INITIAL: Location[] = [
  { name: "Main clinic", detail: "123 Main Street, Melbourne VIC 3000", rooms: 4, status: "Active" },
  { name: "Exam room 1", detail: "Comprehensive eye exams, refraction", rooms: 0, status: "Active" },
  { name: "Exam room 2", detail: "Contact lens fittings, follow-ups", rooms: 0, status: "Active" },
  { name: "Bayside annex", detail: "42 Beach Road, Brighton VIC 3186", rooms: 2, status: "Opening soon" },
];

const EMPTY_FORM = { name: "", detail: "", rooms: "", status: "Active" as Location["status"] };

export function LocationsTab() {
  const [locations, setLocations] = useState(INITIAL);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Location name is required");
      return;
    }
    setLocations((list) => [
      ...list,
      { name: form.name.trim(), detail: form.detail.trim(), rooms: Number(form.rooms) || 0, status: form.status },
    ]);
    toast.success(`${form.name} added`);
    setForm(EMPTY_FORM);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Locations & rooms</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Where your practice sees patients and holds stock.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-[30px] gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          <Plus size={14} />
          Add location
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {locations.map((l) => (
          <div key={l.name} className="flex items-center justify-between gap-[15px] py-1">
            <div className="flex items-center gap-2.5">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
                <MapPin size={16} />
              </span>
              <div>
                <b className="text-[11px] text-[#23342c]">{l.name}</b>
                <p className="mt-[5px] text-[10px] text-[#92988c]">
                  {l.detail}
                  {l.rooms > 0 ? ` · ${l.rooms} exam rooms` : ""}
                </p>
              </div>
            </div>
            <span
              className={
                "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                (l.status === "Active" ? "bg-[#e7efe6] text-[#3e7350]" : "bg-[#f7efd9] text-[#9d7832]")
              }
            >
              <i className="size-[5px] rounded-full bg-current opacity-80" />
              {l.status}
            </span>
          </div>
        ))}
        <SaveRow onSave={() => toast.info("Location settings saved")} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Add location</DialogTitle>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
              Location name
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. North Sydney branch"
                className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
              />
            </label>
            <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
              Address or description
              <input
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                placeholder="e.g. 88 Miller Street, North Sydney NSW"
                className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
                Exam rooms
                <input
                  type="number"
                  min={0}
                  value={form.rooms}
                  onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
                  className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
                />
              </label>
              <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Location["status"] }))}
                  className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
                >
                  <option>Active</option>
                  <option>Opening soon</option>
                </select>
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-9 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
              >
                Add location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

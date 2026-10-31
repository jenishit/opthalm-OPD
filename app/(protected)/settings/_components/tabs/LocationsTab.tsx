"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { createClinicLocation, listClinicLocations } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicLocation, ClinicLocationStatus } from "@/types/clinic-types";

const STATUS_LABEL: Record<ClinicLocationStatus, string> = {
  active: "Active",
  opening_soon: "Opening soon",
};

const EMPTY_FORM = { name: "", address: "", exam_rooms: "", status: "active" as ClinicLocationStatus };

export function LocationsTab() {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    listClinicLocations()
      .then((data) => {
        if (active) setLocations(data);
      })
      .catch((error) => {
        console.error("Failed to load locations", error);
        toast.error("Failed to load locations");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Location name is required");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createClinicLocation({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        exam_rooms: form.exam_rooms ? Number(form.exam_rooms) : undefined,
        status: form.status,
      });
      setLocations((list) => [...list, created]);
      toast.success(`${created.name} added`);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add location");
    } finally {
      setSubmitting(false);
    }
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

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
          <Loader2 size={15} className="animate-spin" /> Loading locations…
        </div>
      ) : locations.length === 0 ? (
        <div className="py-10 text-center text-[11px] text-[#92988c]">No locations added yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {locations.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-[15px] py-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
                  <MapPin size={16} />
                </span>
                <div>
                  <b className="text-[11px] text-[#23342c]">{l.name}</b>
                  <p className="mt-[5px] text-[10px] text-[#92988c]">
                    {l.address}
                    {l.exam_rooms > 0 ? ` · ${l.exam_rooms} exam rooms` : ""}
                  </p>
                </div>
              </div>
              <span
                className={
                  "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                  (l.status === "active" ? "bg-[#e7efe6] text-[#3e7350]" : "bg-[#f7efd9] text-[#9d7832]")
                }
              >
                <i className="size-[5px] rounded-full bg-current opacity-80" />
                {STATUS_LABEL[l.status]}
              </span>
            </div>
          ))}
        </div>
      )}

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
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
                  value={form.exam_rooms}
                  onChange={(e) => setForm((f) => ({ ...f, exam_rooms: e.target.value }))}
                  className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
                />
              </label>
              <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClinicLocationStatus }))}
                  className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
                >
                  <option value="active">Active</option>
                  <option value="opening_soon">Opening soon</option>
                </select>
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-h-9 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c] disabled:opacity-60"
              >
                {submitting ? "Adding…" : "Add location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { NativeSelect } from "@/components/forms";
import { locationSchema, type LocationForm } from "@/schemas/clinic-settings-schema";
import { SettingsField, settingsInput } from "../settings-form";
import { createClinicLocation, listClinicLocations } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicLocation, ClinicLocationStatus } from "@/types/clinic-types";

const STATUS_LABEL: Record<ClinicLocationStatus, string> = {
  active: "Active",
  opening_soon: "Opening soon",
};

const EMPTY_FORM: LocationForm = { name: "", address: "", exam_rooms: "", status: "active" };

export function LocationsTab() {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, formState } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema) as Resolver<LocationForm>,
    defaultValues: EMPTY_FORM,
  });

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

  async function onSubmit(v: LocationForm) {
    try {
      const created = await createClinicLocation({
        name: v.name,
        address: v.address || undefined,
        exam_rooms: v.exam_rooms ? Number(v.exam_rooms) : undefined,
        status: v.status,
      });
      setLocations((list) => [...list, created]);
      toast.success(`${created.name} added`);
      reset(EMPTY_FORM);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add location");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Locations & rooms</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">Where your practice sees patients and holds stock.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-[30px] gap-2 rounded-[7px] border border-line bg-card px-2.5 text-[11px] font-semibold text-ink hover:border-strong hover:bg-app"
        >
          <Plus size={14} />
          Add location
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-mute">
          <Loader2 size={15} className="animate-spin" /> Loading locations…
        </div>
      ) : locations.length === 0 ? (
        <div className="py-10 text-center text-[11px] text-mute">No locations added yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {locations.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-[15px] py-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
                  <MapPin size={16} />
                </span>
                <div>
                  <b className="text-[11px] text-ink">{l.name}</b>
                  <p className="mt-[5px] text-[10px] text-mute">
                    {l.address}
                    {l.exam_rooms > 0 ? ` · ${l.exam_rooms} exam rooms` : ""}
                  </p>
                </div>
              </div>
              <span
                className={
                  "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
                  (l.status === "active" ? "bg-ok-soft text-ok-ink" : "bg-warn-soft text-warn-ink")
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
            <SettingsField control={control} name="name" label="Location name">
              {({ field, id, invalid }) => (
                <input {...field} id={id} aria-invalid={invalid} autoFocus placeholder="e.g. Baneshwor branch" className={settingsInput} />
              )}
            </SettingsField>
            <SettingsField control={control} name="address" label="Address or description">
              {({ field, id, invalid }) => (
                <input {...field} id={id} aria-invalid={invalid} placeholder="e.g. New Baneshwor, Kathmandu" className={settingsInput} />
              )}
            </SettingsField>
            <div className="grid grid-cols-2 gap-3">
              <SettingsField control={control} name="exam_rooms" label="Exam rooms">
                {({ field, id, invalid }) => <input {...field} id={id} type="number" min={0} aria-invalid={invalid} className={settingsInput} />}
              </SettingsField>
              <SettingsField control={control} name="status" label="Status">
                {({ field, id, invalid }) => (
                  <NativeSelect {...field} id={id} aria-invalid={invalid} className={settingsInput}>
                    <option value="active">Active</option>
                    <option value="opening_soon">Opening soon</option>
                  </NativeSelect>
                )}
              </SettingsField>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formState.isSubmitting}
                className="min-h-9 rounded-[7px] border border-sage bg-sage px-3.5 text-[11px] font-semibold text-primary-foreground hover:border-sagehover hover:bg-sagehover disabled:opacity-60"
              >
                {formState.isSubmitting ? "Adding…" : "Add location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

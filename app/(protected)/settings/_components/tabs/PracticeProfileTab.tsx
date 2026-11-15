"use client";

import { useRef, useState } from "react";
import { Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, Globe, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { NativeSelect } from "@/components/forms";
import { practiceProfileSchema, type PracticeProfileForm } from "@/schemas/clinic-settings-schema";
import { getClinic, getClinicSubscription, updateClinic, uploadClinicLogo } from "@/services/clinic-services";
import { useAsync } from "@/lib/hooks/use-async";
import { ApiError } from "@/services/http";
import type { ClinicResponse } from "@/types/clinic-types";
import { SaveRow } from "../SaveRow";
import { SettingsField, SettingsLoading, ToggleField, settingsInput, useSettingsForm } from "../settings-form";

const CURRENCY_OPTIONS = [
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "NPR", label: "NPR — Nepalese Rupee" },
];

const TIMEZONE_OPTIONS = [
  { value: "Australia/Melbourne", label: "Australia / Melbourne" },
  { value: "Asia/Kathmandu", label: "Asia / Kathmandu" },
];

const EMPTY: PracticeProfileForm = {
  clinic_name: "", registration_no: "", tagline: "", address: "", phone: "", email: "", report_footer: "",
  workspace_slug: "", default_currency: "NPR", timezone: "Asia/Kathmandu",
  require_consent_before_exam: false, low_stock_notifications: false, logo_url: "",
};

const toForm = (c: ClinicResponse): PracticeProfileForm => ({
  clinic_name: c.clinic_name,
  registration_no: c.registration_no ?? "",
  tagline: c.tagline ?? "",
  address: c.address ?? "",
  phone: c.phone ?? "",
  email: c.email ?? "",
  report_footer: c.report_footer ?? "",
  workspace_slug: c.workspace_slug ?? "",
  default_currency: c.default_currency ?? "NPR",
  timezone: c.timezone ?? "Asia/Kathmandu",
  require_consent_before_exam: c.require_consent_before_exam ?? false,
  low_stock_notifications: c.low_stock_notifications ?? false,
  logo_url: c.logo_url ?? "",
});

const orUndef = (v: string) => v || undefined;

export function PracticeProfileTab() {
  const clinicId = useRef("");
  const { form, loading, lastSaved, onSave, saving } = useSettingsForm<PracticeProfileForm>({
    resolver: zodResolver(practiceProfileSchema) as Resolver<PracticeProfileForm>,
    defaults: EMPTY,
    noun: "practice settings",
    load: async () => {
      const clinic = await getClinic();
      clinicId.current = clinic.id;
      return toForm(clinic);
    },
    save: async (v) => {
      await updateClinic(clinicId.current, {
        clinic_name: v.clinic_name,
        registration_no: v.registration_no,
        tagline: orUndef(v.tagline),
        address: orUndef(v.address),
        phone: orUndef(v.phone),
        email: orUndef(v.email),
        report_footer: orUndef(v.report_footer),
        workspace_slug: orUndef(v.workspace_slug),
        default_currency: v.default_currency,
        timezone: v.timezone,
        require_consent_before_exam: v.require_consent_before_exam,
        low_stock_notifications: v.low_stock_notifications,
        logo_url: orUndef(v.logo_url),
      });
    },
  });
  const { control } = form;
  const clinicName = useWatch({ control, name: "clinic_name" });
  const logoUrl = useWatch({ control, name: "logo_url" });
  const [logoFailed, setLogoFailed] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // Uploading an image is a paid-plan feature; pasting a link is open to everyone.
  const subscription = useAsync(getClinicSubscription);
  const canUpload = subscription.data?.status === "active";

  async function onLogoFile(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) return void toast.error("Choose a PNG or JPEG image.");
    if (file.size > 2 * 1024 * 1024) return void toast.error("The image must be under 2 MB.");
    setUploading(true);
    try {
      const { logo_url } = await uploadClinicLogo(file);
      form.setValue("logo_url", logo_url, { shouldDirty: true, shouldValidate: true });
      toast.success("Logo uploaded — press Save to keep it.");
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 404
          ? "Image upload isn't available on the server yet. Paste an image link instead."
          : error instanceof Error ? error.message : "Couldn't upload the logo",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (loading) return <SettingsLoading text="Loading practice profile…" />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Practice profile</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">
            Clinic identity shown on prescriptions, receipts, and patient communications.
          </p>
        </div>
        <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-sage-soft px-[7px] py-1 text-[9px] font-semibold leading-none text-sage">
          GROWTH PLAN
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[9px] border border-line bg-app p-[15px]">
        <div className="grid size-[48px] shrink-0 place-items-center overflow-hidden rounded-[13px] bg-sage text-primary-foreground">
          {logoUrl && logoUrl !== logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary https host chosen by the clinic
            <img src={logoUrl} alt={`${clinicName} logo`} referrerPolicy="no-referrer" onError={() => setLogoFailed(logoUrl)} className="size-full object-contain bg-card" />
          ) : (
            <Eye size={28} />
          )}
        </div>
        <div className="min-w-[160px] flex-1">
          <h2 className="m-0 font-display text-base font-semibold text-ink">{clinicName}</h2>
          <Controller
            control={control}
            name="tagline"
            render={({ field }) => (
              <input
                {...field}
                aria-label="Tagline"
                placeholder="A short tagline shown under your clinic name"
                className="m-0 mt-[5px] w-full bg-transparent text-[10px] text-mute outline-none placeholder:text-mute"
              />
            )}
          />
        </div>
        {canUpload && (
          <>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg" className="sr-only" aria-label="Upload logo image" onChange={(e) => void onLogoFile(e.target.files?.[0])} />
            <Button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="min-h-[30px] gap-1.5 rounded-[7px] border border-line bg-card px-2.5 text-[11px] font-semibold text-ink hover:border-strong hover:bg-app"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              Upload logo
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SettingsField
          control={control}
          name="logo_url"
          label="Logo image link"
          description={canUpload ? "Paste a public https:// link, or use Upload logo." : "Paste a public https:// link to your logo. Uploading an image file is available on a paid plan."}
        >
          {({ field, id, invalid }) => <input {...field} id={id} type="url" inputMode="url" placeholder="https://…" aria-invalid={invalid} className={settingsInput} />}
        </SettingsField>
        <SettingsField control={control} name="clinic_name" label="Practice name">
          {({ field, id, invalid }) => <input {...field} id={id} aria-invalid={invalid} className={settingsInput} />}
        </SettingsField>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <SettingsField control={control} name="registration_no" label="Registration number">
            {({ field, id, invalid }) => <input {...field} id={id} aria-invalid={invalid} className={settingsInput} />}
          </SettingsField>
          <SettingsField control={control} name="workspace_slug" label="Workspace URL">
            {({ field, id, invalid }) => (
              <div className="flex min-h-[37px] items-center gap-1.5 rounded-[7px] border border-line bg-card px-2.5 text-[11px] text-ink focus-within:border-sage">
                <Globe size={13} className="shrink-0 text-mute" aria-hidden />
                <input {...field} id={id} aria-invalid={invalid} className="w-20 bg-transparent outline-none" />
                <span className="text-mute">.opthalmok.app</span>
              </div>
            )}
          </SettingsField>
        </div>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <SettingsField control={control} name="email" label="Contact email">
            {({ field, id, invalid }) => <input {...field} id={id} type="email" aria-invalid={invalid} className={settingsInput} />}
          </SettingsField>
          <SettingsField control={control} name="phone" label="Phone number">
            {({ field, id, invalid }) => <input {...field} id={id} type="tel" aria-invalid={invalid} className={settingsInput} />}
          </SettingsField>
        </div>
        <SettingsField control={control} name="address" label="Practice address">
          {({ field, id, invalid }) => <input {...field} id={id} aria-invalid={invalid} className={settingsInput} />}
        </SettingsField>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <SettingsField control={control} name="default_currency" label="Default currency">
            {({ field, id, invalid }) => (
              <NativeSelect {...field} id={id} aria-invalid={invalid} className={settingsInput}>
                {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            )}
          </SettingsField>
          <SettingsField control={control} name="timezone" label="Time zone">
            {({ field, id, invalid }) => (
              <NativeSelect {...field} id={id} aria-invalid={invalid} className={settingsInput}>
                {TIMEZONE_OPTIONS.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </NativeSelect>
            )}
          </SettingsField>
        </div>
        <SettingsField control={control} name="report_footer" label="Footer on printed reports and invoices">
          {({ field, id, invalid }) => <input {...field} id={id} aria-invalid={invalid} className={settingsInput} />}
        </SettingsField>

        <div className="my-1 h-px bg-line" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-ink">Require patient consent before examination</b>
            <p className="mt-[5px] text-[10px] text-mute">Staff must record consent before beginning a clinical examination.</p>
          </div>
          <ToggleField control={control} name="require_consent_before_exam" label="Toggle consent" />
        </div>

        <SaveRow onSave={onSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </form>
  );
}

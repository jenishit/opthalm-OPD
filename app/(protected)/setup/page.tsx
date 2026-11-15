"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, MapPin, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { FormField, NativeSelect } from "@/components/forms";
import { OpsNotice } from "@/components/ui/OpsStat";
import { useAsync } from "@/lib/hooks/use-async";
import {
  CURRENCY_OPTIONS,
  SETUP_STEP_FIELDS,
  TIMEZONE_OPTIONS,
  setupSchema,
  type SetupForm,
} from "@/schemas/setup-schema";
import { getClinic, updateOwnClinic } from "@/services/clinic-services";
import { getMyProfile, updateProfile } from "@/services/profile-services";
import { ApiError } from "@/services/http";

const inputCls =
  "h-10 w-full rounded-[7px] border border-line bg-card px-3 text-[12px] text-ink outline-none focus:border-sage aria-invalid:border-destructive";
const labelCls = "text-[10px] font-semibold text-mute";

const STEPS = [
  {
    title: "Clinic identity",
    description: "How your clinic appears on records, prescriptions and receipts.",
    icon: Building2,
  },
  {
    title: "Practice details",
    description: "Where you operate and the defaults used across the workspace.",
    icon: MapPin,
  },
  {
    title: "Your profile",
    description: "The name your team will see against the work you do.",
    icon: UserRound,
  },
] as const;

const EMPTY: SetupForm = {
  clinic_name: "",
  registration_no: "",
  phone: "",
  email: "",
  address: "",
  tagline: "",
  workspace_slug: "",
  default_currency: "NPR",
  timezone: "Asia/Kathmandu",
  first_name: "",
  last_name: "",
  profile_phone: "",
};

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const loaded = useAsync(async () => {
    const [clinic, profile] = await Promise.all([getClinic(), getMyProfile()]);
    return { clinic, profile };
  });

  const { control, handleSubmit, reset, trigger, formState } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    mode: "onTouched",
    defaultValues: EMPTY,
  });

  // Fill the form once the clinic and profile arrive. The placeholder name a
  // signup starts with is cleared so the admin types their real clinic name.
  useEffect(() => {
    if (!loaded.data) return;
    const { clinic, profile } = loaded.data;
    reset({
      clinic_name: clinic.clinic_name === "New clinic" ? "" : (clinic.clinic_name ?? ""),
      registration_no: clinic.registration_no ?? "",
      phone: clinic.phone ?? "",
      email: clinic.email ?? "",
      address: clinic.address ?? "",
      tagline: clinic.tagline ?? "",
      workspace_slug: clinic.workspace_slug ?? "",
      default_currency: clinic.default_currency ?? "NPR",
      timezone: clinic.timezone ?? "Asia/Kathmandu",
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      profile_phone: profile.phone ?? "",
    });
  }, [loaded.data, reset]);

  async function next() {
    const valid = await trigger(SETUP_STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function finish(v: SetupForm) {
    const profile = loaded.data?.profile;
    if (!profile) return;

    setSaving(true);
    try {
      // The profile is saved first so the clinic is only marked complete once
      // every field in the wizard has actually been stored.
      await updateProfile(profile.user_id, {
        first_name: v.first_name,
        last_name: v.last_name,
        phone: v.profile_phone || undefined,
      });
      await updateOwnClinic({
        clinic_name: v.clinic_name,
        registration_no: v.registration_no,
        tagline: v.tagline || undefined,
        address: v.address || undefined,
        phone: v.phone || undefined,
        email: v.email || undefined,
        workspace_slug: v.workspace_slug || undefined,
        default_currency: v.default_currency,
        timezone: v.timezone,
        setup_completed: true,
      });
      toast.success("Your clinic is set up. Welcome to OpthalmOK.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("One of these clinic details is already registered. Check the registration number, phone and email.");
      } else {
        toast.error(error instanceof ApiError ? error.message : "Couldn't save your setup. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loaded.loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <OpsNotice kind="loading" text="Loading your clinic…" />
      </div>
    );
  }

  if (loaded.error || !loaded.data) {
    return (
      <div className="mx-auto max-w-xl rounded-[13px] border border-line bg-card shadow-sm">
        <OpsNotice kind="error" text={loaded.error ?? "Couldn't load your clinic."} onRetry={loaded.reload} />
      </div>
    );
  }

  if (loaded.data.clinic.setup_completed) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-[13px] border border-line bg-card p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-sage-soft text-sage">
          <Check size={22} />
        </span>
        <h1 className="m-0 mt-4 font-display text-2xl font-semibold text-ink">Your clinic is already set up</h1>
        <p className="m-0 mt-2 text-[12px] text-mute">
          Everything from the setup wizard has been saved. You can change these details any time in settings.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings">Clinic settings</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const CurrentIcon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl font-sans text-[13px] text-ink">
      <div className="mb-5">
        <div className="mb-[7px] flex items-center gap-1.5 text-[9px] font-bold tracking-[1.5px] text-mute">
          <Sparkles size={12} /> WELCOME TO OPTHALMOK
        </div>
        <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">Set up your clinic</h1>
        <p className="m-0 mt-[7px] text-[12px] text-mute">
          Three short steps. Your account stays read-only until the platform team activates it, but you can finish this now.
        </p>
      </div>

      <ol className="mb-4 grid grid-cols-3 gap-2">
        {STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          const Icon = done ? Check : item.icon;
          return (
            <li
              key={item.title}
              className={`flex items-center gap-2 rounded-[9px] border px-3 py-2 text-[10px] ${
                active
                  ? "border-sage bg-sage-soft text-sage"
                  : done
                    ? "border-line bg-card text-sage"
                    : "border-line bg-app text-mute"
              }`}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${
                  active ? "bg-sage text-white" : done ? "bg-sage-soft text-sage" : "bg-line text-mute"
                }`}
              >
                <Icon size={11} />
              </span>
              <span className="truncate font-semibold">{item.title}</span>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={
          isLast
            ? handleSubmit(finish)
            : (event) => {
                // Enter inside an earlier step should advance, not submit the
                // whole wizard with later-step fields still untouched.
                event.preventDefault();
                void next();
              }
        }
        noValidate
        className="overflow-hidden rounded-[13px] border border-line bg-card shadow-sm"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-[18px]">
          <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
            <CurrentIcon size={17} />
          </span>
          <div>
            <div className="text-[9px] font-bold tracking-[1.2px] text-mute">
              STEP {step + 1} OF {STEPS.length}
            </div>
            <h2 className="m-0 mt-0.5 font-display text-base font-semibold text-ink">{current.title}</h2>
            <p className="m-0 mt-0.5 text-[10px] text-mute">{current.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          {step === 0 && (
            <>
              <FormField control={control} name="clinic_name" label="Clinic name" labelClassName={labelCls} className="gap-[7px]">
                {({ field, id, invalid }) => (
                  <Input {...field} id={id} aria-invalid={invalid} autoComplete="organization" placeholder="e.g. ClearView Eye Clinic" className={inputCls} />
                )}
              </FormField>
              <FormField control={control} name="registration_no" label="Registration number" labelClassName={labelCls} className="gap-[7px]">
                {({ field, id, invalid }) => (
                  <Input {...field} id={id} aria-invalid={invalid} placeholder="Clinic or business registration number" className={inputCls} />
                )}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={control} name="phone" label="Clinic phone" labelClassName={labelCls} className="gap-[7px]">
                  {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} autoComplete="tel" className={inputCls} />}
                </FormField>
                <FormField control={control} name="email" label="Clinic email" labelClassName={labelCls} className="gap-[7px]">
                  {({ field, id, invalid }) => (
                    <Input {...field} id={id} type="email" aria-invalid={invalid} autoComplete="email" className={inputCls} />
                  )}
                </FormField>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <FormField control={control} name="address" label="Practice address" labelClassName={labelCls} className="gap-[7px]">
                {({ field, id, invalid }) => (
                  <Input {...field} id={id} aria-invalid={invalid} autoComplete="street-address" placeholder="Street, city, country" className={inputCls} />
                )}
              </FormField>
              <FormField
                control={control}
                name="tagline"
                label="Tagline"
                description="Optional — shown under your clinic name on printed documents."
                labelClassName={labelCls}
                className="gap-[7px]"
              >
                {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} className={inputCls} />}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="default_currency"
                  label="Currency"
                  labelClassName={labelCls}
                  className="gap-[7px]"
                >
                  {({ field, id, invalid }) => (
                    <NativeSelect {...field} id={id} aria-invalid={invalid} className={inputCls}>
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </NativeSelect>
                  )}
                </FormField>
                <FormField control={control} name="timezone" label="Timezone" labelClassName={labelCls} className="gap-[7px]">
                  {({ field, id, invalid }) => (
                    <NativeSelect {...field} id={id} aria-invalid={invalid} className={inputCls}>
                      {TIMEZONE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </NativeSelect>
                  )}
                </FormField>
              </div>
              <FormField
                control={control}
                name="workspace_slug"
                label="Workspace link"
                description="Optional short name for your workspace. Lowercase letters, numbers and dashes only."
                labelClassName={labelCls}
                className="gap-[7px]"
              >
                {({ field, id, invalid }) => (
                  <Input {...field} id={id} aria-invalid={invalid} placeholder="clearview-eye-clinic" className={inputCls} />
                )}
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={control} name="first_name" label="First name" labelClassName={labelCls} className="gap-[7px]">
                  {({ field, id, invalid }) => (
                    <Input {...field} id={id} aria-invalid={invalid} autoComplete="given-name" className={inputCls} />
                  )}
                </FormField>
                <FormField control={control} name="last_name" label="Last name" labelClassName={labelCls} className="gap-[7px]">
                  {({ field, id, invalid }) => (
                    <Input {...field} id={id} aria-invalid={invalid} autoComplete="family-name" className={inputCls} />
                  )}
                </FormField>
              </div>
              <FormField
                control={control}
                name="profile_phone"
                label="Your phone"
                description="Optional — used for team contact and account recovery."
                labelClassName={labelCls}
                className="gap-[7px]"
              >
                {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} autoComplete="tel" className={inputCls} />}
              </FormField>
              <div className="rounded-[9px] border border-line bg-app px-3.5 py-3 text-[10px] text-mute">
                You are signing in as <b className="font-semibold text-ink">{loaded.data.profile.email}</b>. You can invite the rest of your
                team from Team &amp; Roles once the clinic is activated.
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-app px-5 py-3">
          {step === 0 ? (
            <Link href="/dashboard" className="text-[10px] font-semibold text-mute hover:text-ink">
              Skip for now
            </Link>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={saving}>
              <ArrowLeft className="size-3.5" /> Back
            </Button>
          )}

          {isLast ? (
            <Button type="submit" size="sm" disabled={saving || formState.isSubmitting}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {saving ? "Saving setup…" : "Finish setup"}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={next}>
              Continue <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </form>

      <p className="mt-4 text-center text-[10px] text-mute">
        Signed up with the wrong email?{" "}
        <Link href="/login" className="font-semibold text-sage hover:underline">Sign in with another account</Link>
      </p>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Cake,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Mars,
  Phone,
  UserRound,
  Venus,
  type LucideIcon,
} from "lucide-react";
import { patientFormSchema, type PatientFormData, sexOptions } from "@/schemas/patient-schema";
import { createPatient, checkPhoneUnique } from "@/services/patients-services";
import { SessionExpiredError } from "@/services/http";
import { NepaliDateField } from "@/components/ui/NepaliDateField";
import { adToBs, formatAd, formatBs } from "@/lib/nepali-calendar";
import { Chip, Segmented, StepRail, chartField, chartShell } from "@/components/ui/ChartUi";

const labelCls = "block text-sm font-medium text-foreground";
const errorCls = "mt-1.5 text-sm text-destructive";

/** Review line: BS-first ("Chaitra 1, 2048 (Mar 14, 1992)"), AD-only fallback. */
function reviewDob(iso: string): string {
  const bs = adToBs(iso);
  return bs ? `${formatBs(bs, "en")} (${formatAd(iso)})` : formatAd(iso);
}

const steps: { label: string; icon: LucideIcon }[] = [
  { label: "Patient", icon: UserRound },
  { label: "Age", icon: Cake },
  { label: "Contact", icon: Phone },
  { label: "Review", icon: ClipboardList },
];

const sexTiles: { value: (typeof sexOptions)[number]; label: string; icon: LucideIcon }[] = [
  { value: "Female", label: "Female", icon: Venus },
  { value: "Male", label: "Male", icon: Mars },
  { value: "Other", label: "Other", icon: CircleHelp },
];

export function PatientRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [useAge, setUseAge] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema) as never,
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      sex: "Male",
    },
  });

  const values = watch();
  const sex = values.sex;

  const goNext = async () => {
    const fieldsByStep: FieldPath<PatientFormData>[][] = [
      ["first_name", "last_name", "sex"],
      ["date_of_birth", "age"],
      ["phone", "occupation", "address_street", "address_city", "address_state"],
      [],
    ];
    const valid = await trigger(fieldsByStep[step], { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goTo = async (target: number) => {
    if (target <= step) setStep(target);
    else await goNext();
  };

  const toggleAgeMode = () => {
    const next = !useAge;
    setUseAge(next);
    if (next) {
      setValue("date_of_birth", undefined);
      if (values.age == null) setValue("age", 40);
    } else {
      setValue("age", undefined);
    }
    clearErrors(["date_of_birth", "age"]);
  };

  const handlePhoneBlur = async () => {
    const phone = values.phone;
    if (!phone || phone.length < 10) return;
    try {
      const isUnique = await checkPhoneUnique(phone);
      if (!isUnique) {
        setError("phone", { type: "manual", message: "This phone number is already registered" });
      } else {
        clearErrors("phone");
      }
    } catch (error) {
      // SessionExpiredError: redirect to sign-in is already in flight.
      // Any other failure (network, server) skips the advisory check
      // rather than blocking registration on it.
      if (!(error instanceof SessionExpiredError)) {
        console.warn("Phone uniqueness check skipped:", error);
      }
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newPatient = await createPatient(data);
      router.push(`/patients/${newPatient.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to register patient";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFromReview = async () => {
    const valid = await trigger(undefined, { shouldFocus: true });
    if (valid) void handleSubmit(onSubmit)();
  };

  const ageDisplay = values.age != null ? String(values.age) : "\u2014";
  const fullName = [values.first_name, values.last_name].filter(Boolean).join(" ") || "New patient";
  const addressLine = [values.address_street, values.address_city, values.address_state]
    .filter(Boolean)
    .join(", ");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (step === steps.length - 1) void submitFromReview();
        else void goNext();
      }}
      className="flex flex-col gap-5"
    >
      <StepRail steps={steps} current={step} onSelect={goTo} />

      {submitError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {submitError}
        </div>
      ) : null}

      <div className={chartShell}>
        {step === 0 ? (
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[190px_1fr]">
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border/80 bg-muted/30 p-5 text-center">
              <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 font-display text-3xl font-medium text-primary">
                {(values.first_name?.[0] ?? "") + (values.last_name?.[0] ?? "") || <UserRound className="size-10" />}
              </div>
              <p className="font-display text-lg font-medium text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground">{sex ? `${sex} · new registration` : "new registration"}</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className={labelCls}>
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register("first_name")}
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    className={`${chartField} mt-1.5`}
                  />
                  {errors.first_name ? <p className={errorCls}>{errors.first_name.message}</p> : null}
                </div>
                <div>
                  <label htmlFor="last_name" className={labelCls}>
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register("last_name")}
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    className={`${chartField} mt-1.5`}
                  />
                  {errors.last_name ? <p className={errorCls}>{errors.last_name.message}</p> : null}
                </div>
              </div>

              <div>
                <span className={labelCls}>Sex</span>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:max-w-md">
                  {sexTiles.map((tile) => {
                    const Icon = tile.icon;
                    const on = sex === tile.value;
                    return (
                      <button
                        key={tile.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValue("sex", tile.value, { shouldValidate: true, shouldDirty: true })}
                        className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition-colors ${
                          on
                            ? "border-primary bg-primary text-primary-foreground "
                            : "border-border/60 bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-6" />
                        {tile.label}
                      </button>
                    );
                  })}
                </div>
                {errors.sex ? <p className={errorCls}>{errors.sex.message}</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-medium text-foreground">Age verification</p>
                <p className="text-sm text-muted-foreground">
                  Either a date of birth or an exact age is required.
                </p>
              </div>
              <Segmented
                label="Age entry mode"
                value={useAge ? "age" : "dob"}
                onChange={(mode) => {
                  if ((mode === "age") !== useAge) toggleAgeMode();
                }}
                options={[
                  { value: "dob", label: "Date of birth" },
                  { value: "age", label: "Age" },
                ]}
              />
            </div>

            {useAge ? (
              <div className="grid gap-6 rounded-2xl border border-border/60 bg-muted/30 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="age" className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>
                      Years
                    </label>
                    <span className="font-display text-4xl font-medium tabular-nums text-foreground">
                      {ageDisplay}
                    </span>
                  </div>
                  <input
                    id="age"
                    type="range"
                    min="0"
                    max="110"
                    value={values.age ?? 40}
                    onChange={(event) =>
                      setValue("age", Number(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="mt-3 w-full accent-primary"
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="150"
                  aria-label="Age in years"
                  value={values.age ?? ""}
                  onChange={(event) =>
                    setValue("age", event.target.value === "" ? undefined : Number(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`${chartField} w-28 text-center text-lg tabular-nums`}
                />
                {errors.age ? <p className={errorCls}>{errors.age.message}</p> : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                <label htmlFor="date_of_birth" className={labelCls}>
                  Date of birth
                </label>
                <div className="mt-1.5 max-w-xs">
                  <NepaliDateField
                    id="date_of_birth"
                    label="Date of birth"
                    value={values.date_of_birth ?? ""}
                    onChange={(next) =>
                      setValue("date_of_birth", next, { shouldValidate: true, shouldDirty: true })
                    }
                  />
                </div>
                {errors.date_of_birth ? <p className={errorCls}>{errors.date_of_birth.message}</p> : null}
              </div>
            )}

            {errors.date_of_birth && useAge ? (
              <p className={errorCls}>{errors.date_of_birth.message}</p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5 p-5 sm:p-6 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelCls}>
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                {...register("phone")}
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                onBlur={handlePhoneBlur}
                className={`${chartField} mt-1.5`}
              />
              {errors.phone ? <p className={errorCls}>{errors.phone.message}</p> : null}
            </div>
            <div>
              <label htmlFor="occupation" className={labelCls}>
                Occupation
              </label>
              <input
                {...register("occupation")}
                id="occupation"
                type="text"
                className={`${chartField} mt-1.5`}
              />
            </div>

            <div className="sm:col-span-2 sm:mt-2">
              <h3 className="font-display mb-4 border-b border-border/60 pb-2 text-base font-medium text-foreground">
                Address
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address_street" className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>
                    Street / Area
                  </label>
                  <input
                    {...register("address_street")}
                    id="address_street"
                    type="text"
                    className={`${chartField} mt-1.5`}
                  />
                </div>
                <div>
                  <label htmlFor="address_city" className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>
                    City
                  </label>
                  <input
                    {...register("address_city")}
                    id="address_city"
                    type="text"
                    className={`${chartField} mt-1.5`}
                  />
                </div>
                <div>
                  <label htmlFor="address_state" className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>
                    State / Province
                  </label>
                  <input
                    {...register("address_state")}
                    id="address_state"
                    type="text"
                    className={`${chartField} mt-1.5`}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-medium text-primary">
                  {(values.first_name?.[0] ?? "") + (values.last_name?.[0] ?? "") || <UserRound className="size-6" />}
                </div>
                <div>
                  <p className="font-display text-lg font-medium text-foreground">{fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sex}
                    {useAge && values.age != null ? ` · ${values.age} yrs` : ""}
                    {!useAge && values.date_of_birth ? ` · born ${reviewDob(values.date_of_birth)}` : ""}
                  </p>
                </div>
              </div>
              <Chip onClick={() => setStep(0)}>Edit patient</Chip>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <dt className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>Phone</dt>
                <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">
                  {values.phone || "\u2014"}
                </dd>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <dt className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>Occupation</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{values.occupation || "\u2014"}</dd>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:col-span-2">
                <dt className={"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"}>Address</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{addressLine || "\u2014"}</dd>
              </div>
            </dl>

            <p className="text-sm text-muted-foreground">
              Saving creates the patient record. Vision, diagnosis and prescription are captured in the
              first clinical visit.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => (step === 0 ? undefined : setStep(step - 1))}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          {step < steps.length - 1 ? (
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover "
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register Patient"}
              <Check className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

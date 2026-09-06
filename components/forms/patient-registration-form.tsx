"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { patientFormSchema, type PatientFormData, sexOptions } from "@/lib/schemas/patient.schema";
import { createPatient, checkPhoneUnique } from "@/lib/api/patients";

const inputCls =
  "mt-1.5 block w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-organic-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50";
const labelCls = "block text-sm font-medium text-foreground";
const subLabelCls = "block text-xs font-medium text-muted-foreground";
const errorCls = "mt-1.5 text-sm text-destructive";

export function PatientRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [useAge, setUseAge] = useState(false); // Toggle between DOB and Age

  // Using raw react-hook-form without shadcn primitives to avoid dependency issues if shadcn failed
  // but structuring it cleanly
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      sex: "Male",
    },
  });

  const phoneValue = watch("phone");

  // Custom blur handler for phone uniqueness check
  const handlePhoneBlur = async () => {
    if (!phoneValue || phoneValue.length < 10) return;

    const isUnique = await checkPhoneUnique(phoneValue);
    if (!isUnique) {
      setError("phone", { type: "manual", message: "This phone number is already registered" });
    } else {
      clearErrors("phone");
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newPatient = await createPatient(data);
      router.push(`/staff/patients/${newPatient.id}`);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to register patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-2xl bg-destructive/10 p-3.5 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-5 sm:grid-cols-2">
        {/* Name Fields */}
        <div>
          <label htmlFor="first_name" className={labelCls}>
            First Name <span className="text-destructive">*</span>
          </label>
          <input {...register("first_name")} type="text" className={inputCls} />
          {errors.first_name && <p className={errorCls}>{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name" className={labelCls}>
            Last Name <span className="text-destructive">*</span>
          </label>
          <input {...register("last_name")} type="text" className={inputCls} />
          {errors.last_name && <p className={errorCls}>{errors.last_name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input {...register("phone")} onBlur={handlePhoneBlur} type="tel" className={inputCls} />
          {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
        </div>

        {/* Sex */}
        <div>
          <label htmlFor="sex" className={labelCls}>
            Sex <span className="text-destructive">*</span>
          </label>
          <select {...register("sex")} className={inputCls}>
            {sexOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.sex && <p className={errorCls}>{errors.sex.message}</p>}
        </div>

        {/* DOB / Age Toggle Section */}
        <div className="sm:col-span-2 rounded-2xl border border-border/60 bg-muted/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Age Verification <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2.5">
              <span className={`text-xs ${!useAge ? "font-bold text-primary" : "text-muted-foreground"}`}>DOB</span>
              <button
                type="button"
                onClick={() => {
                  setUseAge(!useAge);
                  // Clear the other field when switching
                  if (!useAge) setValue("date_of_birth", undefined);
                  else setValue("age", undefined);
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-3 focus:ring-ring/50 ${useAge ? "bg-primary" : "bg-border"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-organic-sm ring-0 transition duration-200 ease-in-out ${useAge ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className={`text-xs ${useAge ? "font-bold text-primary" : "text-muted-foreground"}`}>Age</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!useAge ? (
              <div>
                <label htmlFor="date_of_birth" className={subLabelCls}>
                  Date of Birth
                </label>
                <input {...register("date_of_birth")} type="date" className={inputCls} />
                {errors.date_of_birth && <p className={errorCls}>{errors.date_of_birth.message}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="age" className={subLabelCls}>
                  Current Age (Years)
                </label>
                <input
                  {...register("age", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="150"
                  className={inputCls}
                />
                {errors.age && <p className={errorCls}>{errors.age.message}</p>}
              </div>
            )}
          </div>
          {(errors.date_of_birth || errors.age) && !errors.date_of_birth?.message && !errors.age?.message && (
            <p className="mt-3 text-sm text-destructive">Please provide either a Date of Birth or an Age.</p>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className={labelCls}>
            Occupation
          </label>
          <input {...register("occupation")} type="text" className={inputCls} />
        </div>

        {/* Address Fields */}
        <div className="sm:col-span-2 mt-2">
          <h3 className="font-display mb-4 border-b border-border/60 pb-2 text-base font-medium text-foreground">
            Address
          </h3>
          <div className="grid grid-cols-1 gap-y-4 gap-x-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address_street" className={subLabelCls}>
                Street / Area
              </label>
              <input {...register("address_street")} type="text" className={inputCls} />
            </div>
            <div>
              <label htmlFor="address_city" className={subLabelCls}>
                City
              </label>
              <input {...register("address_city")} type="text" className={inputCls} />
            </div>
            <div>
              <label htmlFor="address_state" className={subLabelCls}>
                State / Province
              </label>
              <input {...register("address_state")} type="text" className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-organic-sm transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-organic-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-organic disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "Registering..." : "Register Patient"}
        </button>
      </div>
    </form>
  );
}

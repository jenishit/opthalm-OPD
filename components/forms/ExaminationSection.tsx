"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/schemas/shared-schema";
import { Activity, Eye, Focus } from "lucide-react";
import { NumericCell, chartLabel, chartShell } from "@/components/ui";

const dashedField =
  "w-full rounded-xl border-[1.5px] border-dashed border-border/80 bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-solid focus:border-primary focus:ring-3 focus:ring-ring/30";

const sectionIcon = "flex size-8 items-center justify-center rounded-full";
const sectionTitle = "font-display text-lg font-medium text-foreground";

export function ExaminationSection() {
  const { register, control } = useFormContext<IntakeExamFormData>();

  return (
    <div className="space-y-6">
      {/* IOP chart — OD / OS columns like the reference exam chart */}
      <div className={chartShell}>
        <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className={`${sectionIcon} bg-status-examining-bg text-status-examining`}>
            <Activity className="size-4" />
          </span>
          <div>
            <h3 className={sectionTitle}>General &amp; IOP</h3>
            <p className={chartLabel}>Tap a dashed cell to enter a reading</p>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(110px,150px)_1fr_1fr] border-b border-border/60">
          <div className="p-2" />
          <div className={`border-l border-border/60 p-2 text-center ${chartLabel}`}>
            Right eye · OD
          </div>
          <div className={`border-l border-border/60 p-2 text-center ${chartLabel}`}>
            Left eye · OS
          </div>
        </div>

        <div className="grid grid-cols-[minmax(110px,150px)_1fr_1fr] items-center border-b border-border/60">
          <div className="p-3 sm:p-4">
            <p className="font-display text-base font-medium text-foreground">IOP</p>
            <p className={chartLabel}>mmHg</p>
          </div>
          <div className="border-l border-border/60 p-2.5">
            <Controller
              control={control}
              name="examination.iop_od"
              render={({ field }) => (
                <NumericCell
                  label="Intraocular pressure, right eye"
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  step={1}
                  min={1}
                  max={70}
                  decimals={0}
                  signed={false}
                />
              )}
            />
          </div>
          <div className="border-l border-border/60 p-2.5">
            <Controller
              control={control}
              name="examination.iop_os"
              render={({ field }) => (
                <NumericCell
                  label="Intraocular pressure, left eye"
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  step={1}
                  min={1}
                  max={70}
                  decimals={0}
                  signed={false}
                />
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 p-3 sm:grid-cols-2 sm:p-4">
          <div>
            <label htmlFor="iop_time" className={chartLabel}>
              Time of IOP
            </label>
            <input {...register("examination.iop_time")} id="iop_time" type="time" className={`${dashedField} mt-1.5`} />
          </div>
          <div>
            <label htmlFor="bp" className={chartLabel}>
              Blood pressure
            </label>
            <input
              {...register("examination.bp")}
              id="bp"
              type="text"
              placeholder="e.g. 120/80"
              className={`${dashedField} mt-1.5`}
            />
          </div>
        </div>
      </div>

      {/* Orthoptics */}
      <div className={chartShell}>
        <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className={`${sectionIcon} bg-clay-soft text-clay`}>
            <Focus className="size-4" />
          </span>
          <div>
            <h3 className={sectionTitle}>Orthoptics</h3>
            <p className={chartLabel}>motility · alignment</p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-3">
          <div>
            <label htmlFor="convergence" className={chartLabel}>
              Convergence
            </label>
            <textarea
              {...register("examination.convergence")}
              id="convergence"
              rows={3}
              placeholder="NPC..."
              className={`${dashedField} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="cover_test" className={chartLabel}>
              Cover test
            </label>
            <textarea
              {...register("examination.cover_test")}
              id="cover_test"
              rows={3}
              placeholder="Ortho, XT, ET..."
              className={`${dashedField} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="eom" className={chartLabel}>
              Extraocular movements
            </label>
            <textarea
              {...register("examination.eom")}
              id="eom"
              rows={3}
              placeholder="Full, restricted in..."
              className={`${dashedField} mt-1.5`}
            />
          </div>
        </div>
      </div>

      {/* Slit lamp & fundus */}
      <div className={chartShell}>
        <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className={`${sectionIcon} bg-primary/10 text-primary`}>
            <Eye className="size-4" />
          </span>
          <div>
            <h3 className={sectionTitle}>Clinical Evaluation</h3>
            <p className={chartLabel}>slit lamp · fundus</p>
          </div>
        </div>

        <div className="space-y-7 p-4">
          <div>
            <h4 className={`${chartLabel} mb-3`}>Anterior segment (slit lamp)</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-status-examining/20 bg-status-examining-bg/50 p-4">
                <label htmlFor="anterior_segment_od" className="mb-1.5 block text-sm font-semibold text-status-examining">
                  Right eye · OD
                </label>
                <textarea
                  {...register("examination.anterior_segment_od")}
                  id="anterior_segment_od"
                  rows={4}
                  className={dashedField}
                  placeholder="Lids, conjunctiva, cornea, AC, iris, pupil, lens..."
                />
              </div>
              <div className="rounded-2xl border border-status-completed/20 bg-status-completed-bg/50 p-4">
                <label htmlFor="anterior_segment_os" className="mb-1.5 block text-sm font-semibold text-status-completed">
                  Left eye · OS
                </label>
                <textarea
                  {...register("examination.anterior_segment_os")}
                  id="anterior_segment_os"
                  rows={4}
                  className={dashedField}
                  placeholder="Lids, conjunctiva, cornea, AC, iris, pupil, lens..."
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className={`${chartLabel} mb-3`}>Posterior segment (fundus)</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-status-examining/20 bg-status-examining-bg/50 p-4">
                <label htmlFor="fundus_od" className="mb-1.5 block text-sm font-semibold text-status-examining">
                  Right eye · OD
                </label>
                <textarea
                  {...register("examination.fundus_od")}
                  id="fundus_od"
                  rows={4}
                  className={dashedField}
                  placeholder="Disc, macula, vessels, retina..."
                />
              </div>
              <div className="rounded-2xl border border-status-completed/20 bg-status-completed-bg/50 p-4">
                <label htmlFor="fundus_os" className="mb-1.5 block text-sm font-semibold text-status-completed">
                  Left eye · OS
                </label>
                <textarea
                  {...register("examination.fundus_os")}
                  id="fundus_os"
                  rows={4}
                  className={dashedField}
                  placeholder="Disc, macula, vessels, retina..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

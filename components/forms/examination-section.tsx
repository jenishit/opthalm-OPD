"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { Activity, Eye, Focus } from "lucide-react";
import { NumericCell, chartLabel, chartShell } from "./chart-ui";

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

      {/* Slit Lamp & Fundus */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-organic-sm">
        <div className={sectionHeader}>
          <span className={`${sectionIcon} bg-primary/10 text-primary`}>
            <Eye className="h-4 w-4" />
          </span>
          <h3 className={sectionTitle}>Clinical Evaluation</h3>
        </div>

        <div className="space-y-7">

          {/* Anterior Segment */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Anterior Segment (Slit Lamp)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-status-examining-bg/60 p-4 rounded-2xl border border-status-examining/20">
                <label className="block text-sm font-semibold text-status-examining mb-1.5">Right Eye (OD)</label>
                <textarea
                  {...register("examination.anterior_segment_od")}
                  rows={4}
                  className={fieldClass}
                  placeholder="Lids, Conjunctiva, Cornea, AC, Iris, Pupil, Lens..."
                />
              </div>
              <div className="bg-status-completed-bg/60 p-4 rounded-2xl border border-status-completed/20">
                <label className="block text-sm font-semibold text-status-completed mb-1.5">Left Eye (OS)</label>
                <textarea
                  {...register("examination.anterior_segment_os")}
                  rows={4}
                  className={fieldClass}
                  placeholder="Lids, Conjunctiva, Cornea, AC, Iris, Pupil, Lens..."
                />
              </div>
            </div>
          </div>

          {/* Fundus */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Posterior Segment (Fundus)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-status-examining-bg/60 p-4 rounded-2xl border border-status-examining/20">
                <label className="block text-sm font-semibold text-status-examining mb-1.5">Right Eye (OD)</label>
                <textarea
                  {...register("examination.fundus_od")}
                  rows={4}
                  className={fieldClass}
                  placeholder="Disc, Macula, Vessels, Retina..."
                />
              </div>
              <div className="bg-status-completed-bg/60 p-4 rounded-2xl border border-status-completed/20">
                <label className="block text-sm font-semibold text-status-completed mb-1.5">Left Eye (OS)</label>
                <textarea
                  {...register("examination.fundus_os")}
                  rows={4}
                  className={fieldClass}
                  placeholder="Disc, Macula, Vessels, Retina..."
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

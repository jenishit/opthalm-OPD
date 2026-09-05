"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { Eye, Focus, Activity } from "lucide-react";

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-organic-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";
const sectionIcon = "flex size-8 items-center justify-center rounded-full";
const sectionHeader = "flex items-center gap-2.5 border-b border-border/60 pb-3 mb-5";
const sectionTitle = "font-display text-lg font-medium text-foreground";

export function ExaminationSection() {
  const { register } = useFormContext<IntakeExamFormData>();

  return (
    <div className="space-y-6">

      {/* Basic Metrics (IOP etc.) */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-organic-sm">
        <div className={sectionHeader}>
          <span className={`${sectionIcon} bg-status-examining-bg text-status-examining`}>
            <Activity className="h-4 w-4" />
          </span>
          <h3 className={sectionTitle}>General &amp; IOP</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>IOP OD (mmHg)</label>
            <input
              type="text"
              {...register("examination.iop_od")}
              className={fieldClass}
              placeholder="e.g. 15"
            />
          </div>
          <div>
            <label className={labelClass}>IOP OS (mmHg)</label>
            <input
              type="text"
              {...register("examination.iop_os")}
              className={fieldClass}
              placeholder="e.g. 16"
            />
          </div>
          <div>
            <label className={labelClass}>Time of IOP</label>
            <input
              type="time"
              {...register("examination.iop_time")}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Blood Pressure</label>
            <input
              type="text"
              {...register("examination.bp")}
              className={fieldClass}
              placeholder="e.g. 120/80"
            />
          </div>
        </div>
      </div>

      {/* Orthoptics */}
      <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-organic-sm">
        <div className={sectionHeader}>
          <span className={`${sectionIcon} bg-accent/10 text-accent`}>
            <Focus className="h-4 w-4" />
          </span>
          <h3 className={sectionTitle}>Orthoptics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Convergence</label>
            <textarea
              {...register("examination.convergence")}
              rows={2}
              className={fieldClass}
              placeholder="NPC..."
            />
          </div>
          <div>
            <label className={labelClass}>Cover Test</label>
            <textarea
              {...register("examination.cover_test")}
              rows={2}
              className={fieldClass}
              placeholder="Ortho, XT, ET..."
            />
          </div>
          <div>
            <label className={labelClass}>Extraocular Movements (EOM)</label>
            <textarea
              {...register("examination.eom")}
              rows={2}
              className={fieldClass}
              placeholder="Full, Restricted in..."
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

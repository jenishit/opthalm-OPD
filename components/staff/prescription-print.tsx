"use client";

import React, { forwardRef } from "react";
import type { Prescription } from "@/lib/schemas/prescription.schema";
import type { FullVisitData } from "@/lib/api/visits";
import type { Patient } from "@/lib/schemas/patient.schema";
import { Activity } from "lucide-react";

interface PrescriptionPrintProps {
  prescription: Prescription;
  visitData: FullVisitData;
  patient: Patient;
}

export const PrescriptionPrint = forwardRef<HTMLDivElement, PrescriptionPrintProps>(
  ({ prescription, visitData, patient }, ref) => {

    // Helper to format date
    const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      });
    };

    const hasSpectacleRx = (prescription.type === "spectacle" || prescription.type === "combined") && visitData.readings.length > 0;
    const finalReadings = visitData.readings.filter(r => r.stage === "final_rx");
    const rightEye = finalReadings.find(r => r.eye === "OD");
    const leftEye = finalReadings.find(r => r.eye === "OS");

    const hasMeds = (prescription.type === "medication" || prescription.type === "combined") && visitData.treatments.length > 0;

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto font-sans text-black border border-neutral-300 print:border-none min-h-[800px]">
        {/* Clinic Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-10 w-10 text-black" />
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">EyeClinic Center</h1>
              <p className="text-sm text-neutral-700">Comprehensive Eye Care & Surgery</p>
            </div>
          </div>
          <div className="text-right text-sm text-neutral-700">
            <p>123 Health Avenue, Medical District</p>
            <p>Kathmandu, Nepal 44600</p>
            <p>Tel: +977-1-4000000 | Web: eyeclinic.com</p>
          </div>
        </div>

        {/* Prescription Metadata */}
        <div className="flex justify-between items-end mb-6 text-sm">
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-300 w-1/2">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-neutral-700 font-medium">Patient Name:</span>
              <span className="font-bold">{patient.first_name} {patient.last_name}</span>

              <span className="text-neutral-700 font-medium">Age / Sex:</span>
              <span>{patient.age} Y / {patient.sex}</span>

              <span className="text-neutral-700 font-medium">Patient ID:</span>
              <span className="font-mono text-xs">{patient.id}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1"><span className="text-neutral-700 mr-2">Rx No:</span><span className="font-mono font-bold text-black">{prescription.prescription_number}</span></div>
            <div className="mb-1"><span className="text-neutral-700 mr-2">Date:</span><span>{formatDate(prescription.issued_at)}</span></div>
            <div><span className="text-neutral-700 mr-2">Doctor:</span><span className="font-bold">Dr. {prescription.signed_by}</span></div>
          </div>
        </div>

        {/* Diagnosis (if it's a medical Rx) */}
        {hasMeds && visitData.diagnoses.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-2 border-b border-neutral-300 pb-1">Diagnosis</h3>
            <ul className="list-disc pl-5">
              {visitData.diagnoses.map((d, i) => (
                <li key={i} className="mb-1">
                  <span className="font-medium">{d.diagnosis_name}</span>
                  <span className="text-neutral-700 ml-2">({d.laterality})</span>
                  {d.icd10_code && <span className="text-xs text-neutral-700 ml-2">[{d.icd10_code}]</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spectacle Prescription */}
        {hasSpectacleRx && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 border-b border-neutral-300 pb-1">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">Spectacle Prescription</h3>
            </div>

            <table className="w-full text-center border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-400 p-2 text-left">Eye</th>
                  <th className="border border-neutral-400 p-2">Sph (DS)</th>
                  <th className="border border-neutral-400 p-2">Cyl (DC)</th>
                  <th className="border border-neutral-400 p-2">Axis (°)</th>
                  <th className="border border-neutral-400 p-2">Add (DS)</th>
                  <th className="border border-neutral-400 p-2">V/A</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-neutral-400 p-2 font-bold text-left bg-neutral-50">Right (OD)</td>
                  <td className="border border-neutral-400 p-2">{rightEye?.sphere ? (rightEye.sphere > 0 ? `+${rightEye.sphere.toFixed(2)}` : rightEye.sphere.toFixed(2)) : 'plano'}</td>
                  <td className="border border-neutral-400 p-2">{rightEye?.cylinder ? (rightEye.cylinder > 0 ? `+${rightEye.cylinder.toFixed(2)}` : rightEye.cylinder.toFixed(2)) : '-'}</td>
                  <td className="border border-neutral-400 p-2">{rightEye?.axis || '-'}</td>
                  <td className="border border-neutral-400 p-2">{rightEye?.add_power ? `+${rightEye.add_power.toFixed(2)}` : '-'}</td>
                  <td className="border border-neutral-400 p-2">{rightEye?.va || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-neutral-400 p-2 font-bold text-left bg-neutral-50">Left (OS)</td>
                  <td className="border border-neutral-400 p-2">{leftEye?.sphere ? (leftEye.sphere > 0 ? `+${leftEye.sphere.toFixed(2)}` : leftEye.sphere.toFixed(2)) : 'plano'}</td>
                  <td className="border border-neutral-400 p-2">{leftEye?.cylinder ? (leftEye.cylinder > 0 ? `+${leftEye.cylinder.toFixed(2)}` : leftEye.cylinder.toFixed(2)) : '-'}</td>
                  <td className="border border-neutral-400 p-2">{leftEye?.axis || '-'}</td>
                  <td className="border border-neutral-400 p-2">{leftEye?.add_power ? `+${leftEye.add_power.toFixed(2)}` : '-'}</td>
                  <td className="border border-neutral-400 p-2">{leftEye?.va || '-'}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 flex gap-8 text-sm">
              <div><span className="font-medium text-neutral-700 mr-2">Lens Type:</span>{rightEye?.lens_type?.replace("_", " ") || "Not specified"}</div>
              {rightEye?.pd && <div><span className="font-medium text-neutral-700 mr-2">PD:</span>{rightEye.pd} mm</div>}
            </div>
          </div>
        )}

        {/* Medications & Advice */}
        {hasMeds && (
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold text-black mb-4 border-b border-neutral-300 pb-1 flex items-center">
              <span className="text-2xl mr-2">Rx</span>
            </h3>

            <div className="space-y-4 pl-4">
              {visitData.treatments.map((t, i) => (
                <div key={i} className="mb-4">
                  {t.type === "medicine" ? (
                    <div>
                      <div className="font-bold text-lg">{i+1}. {t.medicine_name}</div>
                      <div className="text-neutral-800 mt-1 pl-5">
                        {t.dosage} — {t.frequency} — {t.route}
                      </div>
                      <div className="text-neutral-700 text-sm mt-1 pl-5 font-medium">
                        For {t.duration}
                      </div>
                    </div>
                  ) : t.type === "procedure" ? (
                    <div>
                      <div className="font-bold">{i+1}. {t.procedure_name}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold">{i+1}. Advice / Instructions</div>
                      <div className="text-neutral-800 mt-1 pl-5 whitespace-pre-wrap">{t.advice_text}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow up */}
        {visitData.followUp && (
          <div className="mt-12 pt-4 border-t border-dashed border-neutral-400 flex justify-between items-end">
            <div>
              <div className="text-sm font-bold text-black uppercase tracking-wider mb-1">Follow up</div>
              <div className="font-medium text-lg text-black">{formatDate(visitData.followUp.follow_up_date)}</div>
              {visitData.followUp.reason && <div className="text-sm text-neutral-700 mt-1">Reason: {visitData.followUp.reason}</div>}
            </div>

            {/* Signature Area */}
            <div className="text-center pt-8 border-t border-black w-48 mt-12">
              <div className="font-bold text-black">Dr. {prescription.signed_by}</div>
              <div className="text-xs text-neutral-700">Authorized Signature</div>
            </div>
          </div>
        )}

      </div>
    );
  }
);
PrescriptionPrint.displayName = "PrescriptionPrint";

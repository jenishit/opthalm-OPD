import { PatientProfile } from "@/app/(protected)/patients/[id]/_components/PatientProfile";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Badge,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Glasses,
  Plus,
  Printer,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/shadcn/button";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Normally, this would be an async component fetching data on the server,
  // but since we are mocking, the client component handles the data fetching.
  const { id } = await params;
  const [page, setPage] = useState("patient-details");

  return (
    <>
      <div className="backline">
        <button onClick={() => setPage("Patients")}>
          <ChevronLeft size={16} /> All patients
        </button>
        <span>/</span>
        <span>Patient record</span>
      </div>
      <div className="patient-hero panel">
        <div className="patient-main">
          <Avatar
            initials={selectedPatient.initials}
            tone={selectedPatient.tone}
            size="xl"
          />
          <div>
            <div className="patient-name-line">
              <h1>{selectedPatient.name}</h1>
              <Badge>Active patient</Badge>
            </div>
            <p>
              {selectedPatient.id} <span>·</span> {selectedPatient.age} years
              old <span>·</span> {selectedPatient.gender}
            </p>
            <div className="patient-contact">
              <span>
                <UserRound size={14} />
                {selectedPatient.phone}
              </span>
              <span>
                <CalendarDays size={14} />
                Last visit: {selectedPatient.last}
              </span>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <Button
            variant="secondary"
            onClick={() => console.log("Patient record prepared for printing")}
          >
            <Printer />
            Print record
          </Button>
          <Button onClick={() => setModal("New visit")}>
            <Plus />
            New visit
          </Button>
        </div>
      </div>
      <div className="tabs-line">
        {[
          "Overview",
          "Medical history",
          "Examinations",
          "Prescriptions",
          "Orders",
          "Documents",
        ].map((t) => (
          <button
            className={patientTab === t ? "active" : ""}
            onClick={() => setPatientTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="record-grid">
        <div className="panel record-summary">
          <div className="panel-head">
            <div>
              <h3>
                {patientTab === "Overview" ? "Patient overview" : patientTab}
              </h3>
              <p>Personal details and care information</p>
            </div>
            <button
              className="icon-button"
              onClick={() => setModal("Edit patient")}
            >
              <Settings size={16} />
            </button>
          </div>
          <div className="details-grid">
            <div>
              <span>Date of birth</span>
              <b>14 Mar 1993</b>
            </div>
            <div>
              <span>Blood group</span>
              <b>O+</b>
            </div>
            <div>
              <span>Emergency contact</span>
              <b>James Johnson</b>
            </div>
            <div>
              <span>Contact number</span>
              <b>+61 412 345 678</b>
            </div>
            <div className="full">
              <span>Address</span>
              <b>123 Main Street, Melbourne VIC 3000</b>
            </div>
            <div className="full">
              <span>Known allergies</span>
              <b className="allergy-tag">No known allergies recorded</b>
            </div>
          </div>
          <div className="subsection-title">
            <h3>Medical history</h3>
            <button
              className="text-action"
              onClick={() => setPatientTab("Medical history")}
            >
              View history <ArrowRight size={14} />
            </button>
          </div>
          <div className="history-note">
            <span className="history-dot" />
            <div>
              <b>Routine eye examination</b>
              <p>
                Previous refraction noted mild myopia. No significant ocular
                history reported.
              </p>
              <small>12 Jan 2025 · Dr. Sarah Mitchell</small>
            </div>
          </div>
        </div>
        <div className="panel rx-summary">
          <div className="panel-head">
            <div>
              <h3>Latest prescription</h3>
              <p>Updated today · 09:18 AM</p>
            </div>
            <span className="stat-icon green">
              <Glasses size={18} />
            </span>
          </div>
          <div className="rx-table">
            <div className="rx-labels">
              <span></span>
              <span>SPH</span>
              <span>CYL</span>
              <span>AXIS</span>
              <span>ADD</span>
            </div>
            <div>
              <b>Right (OD)</b>
              <span>+0.25</span>
              <span>-0.75</span>
              <span>180°</span>
              <span>+1.00</span>
            </div>
            <div>
              <b>Left (OS)</b>
              <span>+0.50</span>
              <span>-0.50</span>
              <span>175°</span>
              <span>+1.00</span>
            </div>
          </div>
          <div className="rx-meta">
            <span>Lens type</span>
            <b>Single vision · Anti-reflective</b>
            <span>Pupillary distance</span>
            <b>62 mm</b>
            <span>Valid until</span>
            <b>27 May 2026</b>
          </div>
          <Button variant="secondary" onClick={() => setPage("Prescriptions")}>
            Open prescription <ArrowRight size={14} />
          </Button>
        </div>
        <div className="panel visit-panel">
          <div className="panel-head">
            <div>
              <h3>Recent visits</h3>
              <p>Patient care timeline</p>
            </div>
            <button
              className="text-action"
              onClick={() => setPage("Examinations")}
            >
              All visits <ArrowRight size={14} />
            </button>
          </div>
          <div className="visit-list">
            {[
              {
                date: "27 May 2025",
                type: "Comprehensive eye exam",
                doctor: "Dr. Sarah Mitchell",
                status: "In progress",
              },
              {
                date: "12 Jan 2025",
                type: "Refraction & prescription",
                doctor: "Dr. James Lee",
                status: "Completed",
              },
              {
                date: "04 Jul 2024",
                type: "Routine check-up",
                doctor: "Dr. Sarah Mitchell",
                status: "Completed",
              },
            ].map((v) => (
              <div className="visit-row" key={v.date}>
                <div className="visit-date">
                  <b>{v.date.split(" ")[0]}</b>
                  <span>{v.date.split(" ").slice(1).join(" ")}</span>
                </div>
                <div>
                  <b>{v.type}</b>
                  <span>{v.doctor}</span>
                </div>
                <Badge tone={v.status === "In progress" ? "green" : "neutral"}>
                  {v.status}
                </Badge>
                <ChevronRight size={15} />
              </div>
            ))}
          </div>
        </div>
        <div className="panel orders-summary">
          <div className="panel-head">
            <div>
              <h3>Optical orders</h3>
              <p>Prescription-to-pickup progress</p>
            </div>
            <ShoppingBag size={18} />
          </div>
          <div className="order-card">
            <div className="order-card-top">
              <b>SO-1024 · Everyday spectacles</b>
              <Badge tone="amber">In production</Badge>
            </div>
            <div className="progress-track">
              <span style={{ width: "58%" }} />
            </div>
            <div className="progress-labels">
              <span>Prescription</span>
              <span>In production</span>
              <span>Ready</span>
            </div>
            <div className="order-card-foot">
              <span>Expected collection</span>
              <b>30 May 2025</b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

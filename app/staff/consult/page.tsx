"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Stethoscope, UserRound } from "lucide-react";
import { getPatients } from "@/lib/api/patients";
import type { Patient } from "@/lib/schemas/patient.schema";

export default function ConsultPatientPicker() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPatients()
      .then((records) => {
        if (active) setPatients(records);
      })
      .catch(() => {
        if (active)
          setError(
            "Patient records could not be loaded. Refresh and try again.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPatients = patients.filter((patient) =>
    `${patient.first_name} ${patient.last_name} ${patient.phone}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-5">
      <div>
        <p className="mono-label">Choose a patient to open their clinical examination.</p>
      </div>

      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patients by name or phone"
          aria-label="Search patients by name or phone"
          className="w-full rounded-md border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="divide-y divide-border border-y border-border">
        {loading ? (
          <p className="py-6 text-sm text-muted-foreground">
            Loading patient records...
          </p>
        ) : filteredPatients.length ? (
          filteredPatients.map((patient) => {
            const initials = `${patient.first_name[0] ?? ""}${patient.last_name[0] ?? ""}`;
            return (
              <Link
                key={patient.id}
                href={`/staff/patients/${patient.id}/consult`}
                className="group flex items-center gap-3 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                  {initials || <UserRound className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {patient.age} years · {patient.sex} · {patient.phone}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <Stethoscope className="size-4" />
                  Open
                </span>
              </Link>
            );
          })
        ) : (
          <div className="py-8 text-sm text-muted-foreground">
            {patients.length
              ? "No patients match that search."
              : "No patient records yet. Register a patient before starting a consultation."}
          </div>
        )}
      </div>
    </div>
  );
}

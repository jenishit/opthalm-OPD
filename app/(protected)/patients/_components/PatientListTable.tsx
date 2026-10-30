"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Phone, Filter, Download } from "lucide-react";
import { getPatients } from "@/services/patients-services";
import type { Patient } from "@/schemas/patient-schema";
import { usePatientListStore } from "@/lib/store/patient-list";
import { Button } from "@/components/shadcn/button";

export function PatientListTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = usePatientListStore();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = await getPatients(searchQuery);
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/60 p-4">
        <div className="relative max-w-md inset-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search size={16} className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-input bg-background py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-sm"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            console.log("Filters: All patients · Active · Recently seen")
          }
        >
          <Filter />
          Filters
        </Button>
        <Button
          variant="secondary"
          onClick={() => console.log("Patient list export prepared")}
        >
          <Download />
          Export
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-border/60">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
              >
                Age / Sex
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
              >
                Registered
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Loading patients...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No patients found.{" "}
                  {searchQuery && "Try a different search term."}
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-muted/40 transition-colors group"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {patient.first_name.charAt(0)}
                        {patient.last_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-foreground">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          ID: {patient.id.slice(0, 8).toUpperCase()}…
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {patient.phone}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {patient.age} yrs • {patient.sex}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {patient.created_at
                      ? new Date(patient.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      View Profile
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {patients.length > 0 && (
            <tfoot>
              <tr className="border-t border-border/60">
                <td
                  colSpan={5}
                  className="px-4 py-2.5 text-xs text-muted-foreground sm:px-6"
                >
                  {patients.length}{" "}
                  {patients.length === 1 ? "patient" : "patients"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

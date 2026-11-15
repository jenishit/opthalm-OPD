"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, UserRoundPlus, X } from "lucide-react";
import { getPatients } from "@/services/patients-services";
import type { Patient } from "@/schemas/patient-schema";
import { cacheGet, cacheSet } from "@/lib/offline/cache";

const RECENT_KEY = "patients:recent";
const RECENT_MAX = 200;

export function PatientPicker({
  customer,
  onSelect,
  placeholder = "Search patient by name or phone…",
}: {
  customer: Patient | null;
  onSelect: (patient: Patient | null) => void;
  placeholder?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await getPatients(query || undefined);
        setResults(found);
        // Remember recent look-ups so a patient can still be picked offline.
        // Cleared on sign-out (clearLocalPhi).
        const prev = (await cacheGet<Patient[]>(RECENT_KEY))?.value ?? [];
        const merged = [...found, ...prev.filter((p) => !found.some((f) => f.id === p.id))].slice(0, RECENT_MAX);
        void cacheSet(RECENT_KEY, merged);
      } catch (error) {
        console.error("Failed to search patients", error);
        const q = query.trim().toLowerCase();
        const cached = (await cacheGet<Patient[]>(RECENT_KEY))?.value ?? [];
        setResults(
          cached
            .filter((p) => !q || `${p.first_name} ${p.last_name} ${p.phone}`.toLowerCase().includes(q))
            .slice(0, 20),
        );
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [open, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (customer) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-line bg-app px-3 py-2">
        <div className="flex flex-1 flex-col">
          <b className="text-sm text-foreground">
            {customer.first_name} {customer.last_name}
          </b>
          <span className="text-xs text-muted-foreground">{customer.phone}</span>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Remove customer"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <div
        className="flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm cursor-text focus-within:border-ring"
        onClick={() => setOpen(true)}
      >
        <Search size={15} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-line bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No patients found.</div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-muted/60"
                >
                  <span className="text-sm font-medium text-foreground">
                    {p.first_name} {p.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.phone}</span>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => router.push("/patients/register")}
            className="flex w-full items-center justify-center gap-1.5 border-t border-line p-2.5 text-xs font-semibold text-sage hover:bg-muted/60"
          >
            <UserRoundPlus size={14} />
            Add new patient
          </button>
        </div>
      )}
    </div>
  );
}

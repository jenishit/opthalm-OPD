"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatAgeShort } from "@/lib/age";
import { Search, ChevronRight, Phone, Loader2, X } from "lucide-react";
import { Pager } from "@/components/ui/Pager";
import { usePagination } from "@/lib/hooks/use-pagination";
import { usePatientListStore } from "@/lib/store/patient-list";
import type { Patient } from "@/schemas/patient-schema";
import { ApiError } from "@/services/http";
import { getPatients, getPatientsPage } from "@/services/patients-services";

type SortKey = "name" | "recent" | "phone";

const SORTERS: Record<SortKey, (a: Patient, b: Patient) => number> = {
  name: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
  recent: (a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  phone: (a, b) => (a.phone ?? "").localeCompare(b.phone ?? ""),
};

/** The search endpoint returns at most this many matches. */
const SEARCH_LIMIT = 50;

interface BrowsePage {
  key: string;
  items: Patient[];
  total: number;
  error?: string;
}

/**
 * Two modes:
 *  - browsing (empty search): server-side pages, newest first, with the clinic's
 *    real total from the backend — it never loads the whole patient list;
 *  - searching: the server's matches (up to 50), sorted and paged locally.
 */
export function PatientListTable() {
  const { searchQuery, setSearchQuery } = usePatientListStore();
  const query = searchQuery.trim();
  const searchRef = useRef<HTMLInputElement>(null);

  // ── browsing ──
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tick, setTick] = useState(0);
  const [browse, setBrowse] = useState<BrowsePage | null>(null);
  const browseKey = `${page}|${pageSize}|${tick}`;

  useEffect(() => {
    if (query) return;
    let active = true;
    getPatientsPage(pageSize, (page - 1) * pageSize)
      .then((r) => active && setBrowse({ key: browseKey, ...r }))
      .catch((e) => active && setBrowse({ key: browseKey, items: [], total: 0, error: e instanceof ApiError ? e.message : "Couldn't load patients" }));
    return () => {
      active = false;
    };
  }, [query, page, pageSize, browseKey]);
  const browseLoading = !query && browse?.key !== browseKey;

  // ── searching ──
  const [found, setFound] = useState<Patient[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    if (!query) return;
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getPatients(query);
        if (active) setFound(data);
      } catch (error) {
        console.error("Failed to search patients", error);
        if (active) setFound([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const searchResults = useMemo(() => [...(found ?? [])].sort(SORTERS[sort]), [found, sort]);
  const searchPg = usePagination(searchResults, `${query}|${sort}`, 25);

  // Ctrl/⌘ + K focuses the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = query ? searchPg.pageItems : (browse?.items ?? []);
  const loading = query ? searching && found === null : browseLoading;
  const error = !query && !browseLoading ? browse?.error : undefined;
  const total = query ? searchResults.length : (browse?.total ?? 0);
  const label = loading
    ? "Loading…"
    : query
      ? `${total}${total >= SEARCH_LIMIT ? "+" : ""} ${total === 1 ? "match" : "matches"}`
      : `${total.toLocaleString()} ${total === 1 ? "patient" : "patients"}`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search patients by name or phone number"
            className="block h-10 w-full rounded-full border border-input bg-background pl-10 pr-20 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
            placeholder="Search by name or phone number…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFound(null);
            }}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {searching && <Loader2 size={14} className="animate-spin text-muted-foreground" aria-label="Searching" />}
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFound(null);
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">Ctrl K</kbd>
            )}
          </div>
        </div>

        {query ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              <option value="name">Name</option>
              <option value="recent">Recently added</option>
              <option value="phone">Phone</option>
            </select>
          </label>
        ) : (
          <span className="text-xs text-muted-foreground">Newest first</span>
        )}

        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">{label}</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-border/60">
          <thead className="sticky top-0 z-10 bg-muted/50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Contact</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Age / Sex</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Registered</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Loading patients...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} role="alert" className="py-10 text-center text-sm text-destructive">
                  {error}{" "}
                  <button type="button" onClick={() => setTick((t) => t + 1)} className="font-semibold underline">Retry</button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No patients found. {query && "Try a different search term."}
                </td>
              </tr>
            ) : (
              rows.map((patient) => (
                <tr key={patient.id} className="group transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                        {patient.first_name.charAt(0)}
                        {patient.last_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-foreground">{patient.first_name} {patient.last_name}</div>
                        <div className="text-xs text-muted-foreground">ID: {patient.id.slice(0, 8).toUpperCase()}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {patient.phone}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{formatAgeShort(patient.date_of_birth, patient.age)} • {patient.sex}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/patients/${patient.id}`} className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
                      View Profile
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {query ? (
        !loading && <Pager page={searchPg.page} pageCount={searchPg.pageCount} pageSize={searchPg.pageSize} total={searchPg.total} onPage={searchPg.setPage} onPageSize={searchPg.setPageSize} noun="matches" />
      ) : (
        !browseLoading && !error && (
          <Pager
            page={page}
            pageCount={Math.max(1, Math.ceil(total / pageSize))}
            pageSize={pageSize}
            total={total}
            onPage={setPage}
            onPageSize={(n) => {
              setPageSize(n);
              setPage(1);
            }}
            noun="patients"
          />
        )
      )}
    </div>
  );
}

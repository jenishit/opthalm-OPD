"use client";

import { usePagination } from "@/lib/hooks/use-pagination";
import { Pager } from "@/components/ui/Pager";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OpsNotice, opsCard } from "@/components/ui/OpsStat";
import { ROLE_LABEL, ROLE_SCOPE } from "@/lib/permissions";
import type { Profile } from "@/types/profile-types";
import { toStaffRoleName } from "./role-name";

const initials = (p: Profile) => `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase() || "?";

export function TeamTable({
  members,
  loading,
  error,
  onRetry,
}: {
  members: Profile[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.first_name} ${m.last_name} ${m.email} ${m.phone ?? ""} ${m.role_name}`.toLowerCase().includes(q),
    );
  }, [members, query]);

  const pg = usePagination(filtered, query, 25);

  return (
    <div className={`overflow-hidden ${opsCard}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-[18px] py-4">
        <label className="flex h-9 min-w-[215px] items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-mute">
          <Search size={14} aria-hidden />
          <input
            aria-label="Search team members"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team members…"
            className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-mute"
          />
        </label>
        <span className="text-[10px] text-mute">{filtered.length} of {members.length}</span>
      </div>

      {loading ? (
        <OpsNotice kind="loading" text="Loading team…" />
      ) : error ? (
        <OpsNotice kind="error" text={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <OpsNotice kind="empty" text={members.length ? "No one matches your search." : "No team members yet."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left">
            <thead className="bg-app">
              <tr>
                {["TEAM MEMBER", "ROLE", "ACCESS SCOPE", "PHONE"].map((h) => (
                  <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map((m) => {
                const role = toStaffRoleName(m.role_name);
                return (
                  <tr key={m.id} className="hover:bg-app">
                    <td className="border-t border-line px-[17px] py-3">
                      <div className="flex items-center gap-[9px]">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-soft text-[10px] font-bold text-sage">
                          {initials(m)}
                        </span>
                        <div className="flex flex-col gap-1">
                          <b className="text-[10px] text-ink">{`${m.first_name} ${m.last_name}`.trim()}</b>
                          <span className="text-[9px] text-mute">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="border-t border-line px-[17px] py-3">
                      <span className="rounded-[5px] bg-app px-2 py-1 text-[9px] text-mute">
                        {role ? ROLE_LABEL[role] : m.role_name}
                      </span>
                    </td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">
                      {role ? ROLE_SCOPE[role] : "Unrecognised role — no console access"}
                    </td>
                    <td className="border-t border-line px-[17px] py-3 text-[10px] text-mute">{m.phone || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && <Pager page={pg.page} pageCount={pg.pageCount} pageSize={pg.pageSize} total={pg.total} onPage={pg.setPage} onPageSize={pg.setPageSize} noun="members" />}
    </div>
  );
}

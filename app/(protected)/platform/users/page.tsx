"use client";

import { useMemo, useState } from "react";
import { Building2, HeartPulse, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { OpsNotice, OpsStat, opsCard } from "@/components/ui/OpsStat";
import { Pager } from "@/components/ui/Pager";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatCurrency } from "@/lib/utils";
import { formatDate, roleLabel } from "../_components/platform-utils";
import { usePlatformUsers } from "../_components/use-platform";

export default function PlatformUsersPage() {
  const { data, loading, error, reload } = usePlatformUsers();
  const [query, setQuery] = useState("");
  const [clinic, setClinic] = useState("all");
  const [role, setRole] = useState("all");

  const users = useMemo(() => data?.users ?? [], [data]);
  const totals = data?.totals;

  const clinics = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of users) map.set(user.clinic_id, user.clinic_name || "Unnamed clinic");
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [users]);

  const roles = useMemo(() => {
    const set = new Set(users.map((user) => user.role_name));
    return [...set].sort((a, b) => roleLabel(a).localeCompare(roleLabel(b)));
  }, [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !needle ||
        `${user.full_name} ${user.email} ${user.clinic_name} ${user.phone ?? ""}`
          .toLowerCase()
          .includes(needle);
      const matchesClinic = clinic === "all" || user.clinic_id === clinic;
      const matchesRole = role === "all" || user.role_name === role;
      return matchesQuery && matchesClinic && matchesRole;
    });
  }, [users, query, clinic, role]);

  const pg = usePagination(filtered, `${query}|${clinic}|${role}`, 25);

  return (
    <div className="font-sans text-[13px] text-ink">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-mute">PLATFORM / ACCOUNTS</div>
          <h1 className="m-0 font-display text-[29px] font-semibold tracking-[-0.5px] text-ink">Accounts</h1>
          <p className="m-0 mt-[7px] text-[12px] text-mute">
            Every staff and patient-portal login across the platform, with what each person has recorded.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          aria-label="Refresh accounts"
          className="grid size-9 place-items-center rounded-[7px] border border-line bg-card text-mute transition-colors hover:border-strong hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <OpsStat
          label="Total accounts"
          value={totals ? totals.users.toLocaleString() : "…"}
          foot="logins across every tenant"
          icon={Users}
          bg="bg-sage-soft"
          text="text-sage"
        />
        <OpsStat
          label="Staff"
          value={totals ? totals.staff_users.toLocaleString() : "…"}
          foot="clinical and operational users"
          icon={ShieldCheck}
          bg="bg-t-new-soft"
          text="text-t-new"
        />
        <OpsStat
          label="Patient portal"
          value={totals ? totals.portal_users.toLocaleString() : "…"}
          foot="patient self-service logins"
          icon={HeartPulse}
          bg="bg-warn-soft"
          text="text-warn-ink"
        />
        <OpsStat
          label="Super admins"
          value={totals ? totals.superadmins.toLocaleString() : "…"}
          foot="platform operators"
          icon={Building2}
          bg="bg-t-surg-soft"
          text="text-t-surg"
        />
      </div>

      <div className={`overflow-hidden ${opsCard}`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-[18px] py-4">
          <label className="flex h-9 min-w-[215px] flex-1 items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-mute md:max-w-xs">
            <Search size={14} aria-hidden />
            <input
              aria-label="Search accounts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, clinic or phone…"
              className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-mute"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-[7px] text-[10px] text-mute">
              <Building2 size={12} />
              <span className="sr-only">Filter by clinic</span>
              <select
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                className="max-w-[190px] bg-transparent text-[10px] text-ink outline-none"
              >
                <option value="all">All clinics</option>
                {clinics.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-[7px] text-[10px] text-mute">
              <SlidersHorizontal size={12} />
              <span className="sr-only">Filter by role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-[10px] text-ink outline-none"
              >
                <option value="all">All roles</option>
                {roles.map((item) => (
                  <option key={item} value={item}>{roleLabel(item)}</option>
                ))}
              </select>
            </label>
          </div>
          <span className="ml-auto text-[10px] text-mute">{filtered.length} of {users.length}</span>
        </div>

        {loading && users.length === 0 ? (
          <OpsNotice kind="loading" text="Loading accounts…" />
        ) : error && users.length === 0 ? (
          <OpsNotice kind="error" text={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <OpsNotice kind="empty" text={users.length ? "No account matches these filters." : "No accounts yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse whitespace-nowrap text-left">
              <thead className="bg-app">
                <tr>
                  {["ACCOUNT", "CLINIC", "ROLE", "JOINED", "PATIENTS", "VISITS", "INVOICES", "COLLECTED"].map((header) => (
                    <th key={header} className="px-[15px] py-3 text-[9px] font-bold tracking-[0.7px] text-mute">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pg.pageItems.map((user) => (
                  <tr key={user.id} className="hover:bg-app">
                    <td className="border-t border-line px-[15px] py-3">
                      <b className="block max-w-[220px] truncate text-[11px] font-semibold text-ink">
                        {user.full_name || user.email || "Unnamed account"}
                      </b>
                      <span className="block max-w-[220px] truncate text-[9px] text-mute">
                        {user.email}{user.phone ? ` · ${user.phone}` : ""}
                      </span>
                    </td>
                    <td className="border-t border-line px-[15px] py-3">
                      <span className="block max-w-[180px] truncate text-[10px] text-ink">{user.clinic_name || "—"}</span>
                    </td>
                    <td className="border-t border-line px-[15px] py-3">
                      <span className="rounded-[5px] bg-app px-1.5 py-0.5 text-[9px] font-semibold text-mute">
                        {roleLabel(user.role_name)}
                      </span>
                    </td>
                    <td className="border-t border-line px-[15px] py-3 text-[10px] text-mute">{formatDate(user.created_at)}</td>
                    <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{user.patients_registered.toLocaleString()}</td>
                    <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{user.visits_examined.toLocaleString()}</td>
                    <td className="border-t border-line px-[15px] py-3 text-[11px] text-ink">{user.invoices_created.toLocaleString()}</td>
                    <td className="border-t border-line px-[15px] py-3 text-[11px] font-semibold text-ink">
                      {formatCurrency(user.revenue_collected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <Pager
            page={pg.page}
            pageCount={pg.pageCount}
            pageSize={pg.pageSize}
            total={pg.total}
            onPage={pg.setPage}
            onPageSize={pg.setPageSize}
            noun="accounts"
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const SIZES = [10, 25, 50, 100];

/** Prev / next pager with a "x–y of N" summary and a page-size picker. */
export function Pager({
  page,
  pageCount,
  pageSize,
  total,
  onPage,
  onPageSize,
  noun = "items",
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize?: (size: number) => void;
  noun?: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn =
    "grid size-8 place-items-center rounded-md border border-line bg-card text-muted-foreground hover:border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted-foreground">
      <span>
        {from}–{to} of {total} {noun}
      </span>
      <div className="flex items-center gap-3">
        {onPageSize && (
          <label className="flex items-center gap-1.5">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-line bg-card px-1.5 text-foreground"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <span aria-live="polite">Page {page} of {pageCount}</span>
        <div className="flex gap-1">
          <button type="button" className={btn} onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft size={15} />
          </button>
          <button type="button" className={btn} onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Next page">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}

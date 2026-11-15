"use client";

import { useMemo, useState } from "react";

/**
 * Client-side pagination over an already-loaded list. `resetKey` (e.g. the
 * active tab + search text) sends the user back to page 1 when the filter changes.
 */
export function usePagination<T>(items: T[], resetKey: string, initialSize = 25) {
  const [pageSize, setPageSize] = useState(initialSize);
  const [state, setState] = useState({ page: 1, key: resetKey });

  // Reset during render (not in an effect) when the filter changes.
  const page = state.key === resetKey ? state.page : 1;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return {
    pageItems,
    page: safePage,
    pageCount,
    pageSize,
    total: items.length,
    setPage: (p: number) => setState({ page: Math.min(Math.max(1, p), pageCount), key: resetKey }),
    setPageSize: (n: number) => {
      setPageSize(n);
      setState({ page: 1, key: resetKey });
    },
  };
}

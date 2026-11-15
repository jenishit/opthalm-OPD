"use client";

import { useEffect, useState } from "react";
import { idbAvailable } from "./idb";
import { listOutbox, onOutboxChange, type QueuedSale } from "./outbox";

/** Live view of the sale outbox (this tab and others via the change event). */
export function useOutbox() {
  const [items, setItems] = useState<QueuedSale[]>([]);

  useEffect(() => {
    if (!idbAvailable()) return;
    let active = true;
    const load = () => {
      listOutbox()
        .then((rows) => {
          if (active) setItems(rows);
        })
        .catch(() => {});
    };
    load();
    const off = onOutboxChange(load);
    return () => {
      active = false;
      off();
    };
  }, []);

  return {
    items,
    pending: items.filter((i) => i.status === "pending").length,
    failed: items.filter((i) => i.status === "failed").length,
  };
}

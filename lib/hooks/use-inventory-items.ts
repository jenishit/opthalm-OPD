"use client";

import { useCallback, useEffect, useState } from "react";
import { listInventoryItems, searchInventoryItems } from "@/services/inventory-services";
import type { InventoryItem } from "@/types/inventory-types";
import { cacheGet, cacheSet } from "@/lib/offline/cache";
import { fetchAll } from "@/lib/pagination";

const CACHE_KEY = "inventory:items";

function matches(item: InventoryItem, q: string) {
  const hay = `${item.name} ${item.brand ?? ""} ${item.model ?? ""} ${item.sku}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

/**
 * Fetches the live inventory catalog (ALL pages, not just the first 100),
 * debouncing free-text search. Shared by the Inventory table and the POS grid.
 *
 * The full catalog is mirrored to IndexedDB; when the network is down the last
 * known catalog is served (`fromCache`) so the POS keeps working offline.
 */
export function useInventoryItems(search: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let active = true;
    const q = search.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        if (q) {
          const data = await searchInventoryItems(q);
          if (active) {
            setItems(data);
            setCachedAt(null);
          }
        } else {
          const { items: all, truncated: cut } = await fetchAll(listInventoryItems);
          if (active) {
            setItems(all);
            setTruncated(cut);
            setCachedAt(null);
          }
          void cacheSet(CACHE_KEY, all);
        }
      } catch (e) {
        console.error("Failed to fetch inventory items", e);
        // Network (or server) down: fall back to the last known catalog.
        const cached = await cacheGet<InventoryItem[]>(CACHE_KEY);
        if (!active) return;
        if (cached) {
          setItems(q ? cached.value.filter((i) => matches(i, q)) : cached.value);
          setCachedAt(cached.savedAt);
        } else {
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);
  return {
    items,
    loading,
    error,
    fromCache: cachedAt !== null,
    cachedAt,
    truncated,
    refresh,
  };
}

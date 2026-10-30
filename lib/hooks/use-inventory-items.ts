"use client";

import { useCallback, useEffect, useState } from "react";
import { listInventoryItems, searchInventoryItems } from "@/services/inventory-services";
import type { InventoryItemDTO } from "@/types/api-types";
import { MOCK_INVENTORY } from "@/lib/mock/inventory";

/**
 * Fetches the live inventory catalog, debouncing free-text search. Shared by
 * the Inventory table and the POS product grid so both read the same stock.
 * Falls back to MOCK_INVENTORY only when the real catalog is genuinely empty
 * with no search in effect — a fresh clinic has nothing stocked yet otherwise.
 */
export function useInventoryItems(search: string) {
  const [items, setItems] = useState<InventoryItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = search.trim()
          ? await searchInventoryItems(search.trim())
          : await listInventoryItems();
        if (active) setItems(data);
      } catch (error) {
        console.error("Failed to fetch inventory items", error);
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
  const usingMock = !loading && items.length === 0 && !search.trim();

  return { items: usingMock ? MOCK_INVENTORY : items, loading, usingMock, refresh };
}

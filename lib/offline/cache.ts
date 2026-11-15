import { idbDelete, idbGet, idbGetAll, idbPut } from "./idb";

interface CacheRow<T> {
  key: string;
  value: T;
  savedAt: number;
}

const PREFIX = "cache:";

/** Stale-while-offline cache for read-only server data (catalog, patient look-ups). */
export async function cacheSet<T>(name: string, value: T): Promise<void> {
  try {
    await idbPut<CacheRow<T>>("kv", { key: PREFIX + name, value, savedAt: Date.now() });
  } catch {
    /* cache is best-effort */
  }
}

export async function cacheGet<T>(name: string): Promise<{ value: T; savedAt: number } | null> {
  try {
    const row = await idbGet<CacheRow<T>>("kv", PREFIX + name);
    return row ? { value: row.value, savedAt: row.savedAt } : null;
  } catch {
    return null;
  }
}

/**
 * Remove everything that may hold patient data from this device: read caches
 * and the saved POS draft. Called on every staff sign-out. The financial
 * records (outbox, sales/refund ledger, shifts) are deliberately kept — they
 * are unsynced money, not a cache.
 */
export async function clearLocalPhi(): Promise<void> {
  try {
    const rows = await idbGetAll<{ key: string }>("kv");
    await Promise.all(
      rows.filter((r) => r.key.startsWith(PREFIX) || r.key === "pos:draft").map((r) => idbDelete("kv", r.key)),
    );
  } catch {
    /* nothing to clear */
  }
  if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "clear-caches" });
  }
}

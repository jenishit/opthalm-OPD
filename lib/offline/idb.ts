/**
 * Tiny promise wrapper over IndexedDB (no dependency). One database, a handful
 * of object stores:
 *   kv       – generic key/value (caches, POS draft state, counters)
 *   outbox   – POS sales waiting to be synced to the backend
 *   sales    – local sale ledger (per-terminal, feeds shift Z-reports)
 *   refunds  – local refund ledger
 *   shifts   – cash-drawer shifts and their closed Z-report snapshots
 */
const DB_NAME = "opd-offline";
const DB_VERSION = 1;

export type StoreName = "kv" | "outbox" | "sales" | "refunds" | "shifts";
const KEY_PATH: Record<StoreName, string> = { kv: "key", outbox: "id", sales: "id", refunds: "id", shifts: "id" };

let dbPromise: Promise<IDBDatabase> | null = null;

export function idbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function open(): Promise<IDBDatabase> {
  if (!idbAvailable()) return Promise.reject(new Error("IndexedDB is not available"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, keyPath] of Object.entries(KEY_PATH)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // If another tab upgrades the schema, drop our handle so the next call reopens.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

async function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    // Resolve on transaction completion so a write is durable when we return.
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const idbGet = <T>(store: StoreName, key: string) =>
  run<T | undefined>(store, "readonly", (s) => s.get(key) as IDBRequest<T | undefined>);
export const idbGetAll = <T>(store: StoreName) => run<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
export const idbPut = <T>(store: StoreName, value: T) => run(store, "readwrite", (s) => s.put(value));
export const idbDelete = (store: StoreName, key: string) => run(store, "readwrite", (s) => s.delete(key));
export const idbClear = (store: StoreName) => run(store, "readwrite", (s) => s.clear());

/** Atomic read-modify-write on one record (used for counters). */
export async function idbUpdate<T extends object>(
  store: StoreName,
  key: string,
  fn: (current: T | undefined) => T,
): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const os = tx.objectStore(store);
    let next: T;
    const get = os.get(key);
    get.onsuccess = () => {
      next = fn(get.result as T | undefined);
      os.put(next);
    };
    tx.oncomplete = () => resolve(next);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

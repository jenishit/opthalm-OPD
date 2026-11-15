"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Reactive `navigator.onLine`. Treats the server render as online. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

/** True for a failed `fetch` (no connectivity) as opposed to an HTTP error response. */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

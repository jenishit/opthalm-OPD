import { create } from "zustand";

/**
 * Whether this clinic account is fully active. A freshly signed-up clinic is
 * "pending": it can finish its setup (clinic profile and settings) and browse,
 * but every other change is blocked until a platform operator activates it.
 * The backend enforces the same rule; this keeps the UI honest and explains why.
 */
export type AccountState = "unknown" | "active" | "pending" | "inactive";

interface AccountStore {
  state: AccountState;
  setState: (state: AccountState) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({ state: "unknown", setState: (state) => set({ state }) }));

/** Writes a pending clinic may still make: its own profile/settings, and session calls. */
const SETUP_WRITE_PREFIXES = ["/admin/clinic", "/auth/", "/profile/"];

export function isWriteAllowedWhilePending(path: string): boolean {
  return SETUP_WRITE_PREFIXES.some((p) => path.startsWith(p));
}

export const PENDING_MESSAGE = "Your clinic is awaiting activation, so changes are disabled for now. You can still complete your clinic profile.";

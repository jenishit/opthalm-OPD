# Offline mode, POS shifts, refunds and Nepal tax invoices

## What works offline
- **App shell** – `public/sw.js` (registered in production only) caches static assets and
  page HTML/RSC so visited pages open without a network. It never caches `/api/*` or uploads.
  Caches are wiped on sign-out.
- **POS catalog** – the full inventory is mirrored to IndexedDB (`lib/hooks/use-inventory-items.ts`);
  offline the last known catalog is served and labelled with its timestamp.
- **Patient picker** – recent look-ups are cached so a patient can be chosen offline.
- **Cart / held sales** – persisted to IndexedDB (`pos:draft`), survive refresh and crashes.
- **Sales** – written to the IndexedDB *outbox before any network call* (`lib/offline/outbox.ts`).
  They sync automatically when back online (`OfflineStatus`), oldest first, resuming exactly
  where they stopped (invoice created → payment recorded), with an `Idempotency-Key` per step.
  Failed sales stay visible in **POS → Sync queue** with Retry / Discard.
- **Shifts, Z-reports, refund log** – local to the terminal (IndexedDB).

## What does NOT work offline
Refunds (money going out must be confirmed by the server), patient registration, inventory edits,
reports, and any page not yet visited on this device.

## Data on the device
Cached catalog/patients and the POS draft are removed on every sign-out
(`clearLocalPhi`). The outbox, sales/refund ledger and shifts are kept (they are unsynced money).
They are **not encrypted at rest** — keep terminals physically controlled.

## Shifts and Z-reports
`lib/pos/shift.ts`. One open shift per terminal; checkout requires it. Closing stores an
immutable Z-report snapshot with a sequential per-terminal number. Reports cover sales made
on **this** terminal only. Failed sales are excluded from totals and flagged.

## Nepal tax invoice (`/pos/invoice/[id]`)
Seller PAN/VAT, sequential invoice number, date in AD and BS, buyer details (optional buyer PAN),
quantity/rate/discount/amount, taxable value, VAT, total, amount in words (lakh/crore), signatures,
and **Original / Copy of Original (n)** tracked per terminal. Seller details come from the admin-only
clinic endpoints and are cached on the device the first time an admin opens an invoice there.

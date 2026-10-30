import type { InventoryItem, Patient } from "./types";

/** Sample existing patients for the "Existing patient" lookup step — no backend endpoint exists yet for this wizard. */
export const MOCK_PATIENTS: Patient[] = [
  {
    id: "OPH-2026-0001",
    name: "Aarav Khadka",
    age: 52,
    g: "m",
    conds: ["cataract"],
    urg: "warn",
    photo: null,
    visits: [{ ago: 14, dx: "cataract", od: [-1.25, -0.5, 90], os: [-1.0, -0.25, 85], iop: [19, 18] }],
  },
  {
    id: "OPH-2026-0002",
    name: "Sabina Lama",
    age: 34,
    g: "f",
    conds: ["refractive"],
    urg: "ok",
    photo: null,
    visits: [{ ago: 42, dx: "refractive", od: [-2.5, -0.75, 10], os: [-2.25, -0.5, 170], iop: [15, 16] }],
  },
  {
    id: "OPH-2026-0003",
    name: "Roshan Pandey",
    age: 61,
    g: "m",
    conds: ["glaucoma"],
    urg: "bad",
    photo: null,
    visits: [{ ago: 7, dx: "glaucoma", od: [0, 0, null], os: [0, 0, null], iop: [27, 24] }],
  },
];

/** Sample dispensable catalog for the prescription step — no inventory endpoint is wired up for this wizard yet. */
export const MOCK_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Ray-Ban Classic Frame", cat: "frames", qty: 12, hue: 28 },
  { id: "inv-2", name: "Titanium Round Frame", cat: "frames", qty: 6, hue: 150 },
  { id: "inv-3", name: "Acuvue Oasys Monthly", cat: "contact", qty: 24, hue: 200 },
  { id: "inv-4", name: "Biofinity Toric", cat: "contact", qty: 18, hue: 260 },
  { id: "inv-5", name: "Lightweight Flex Frame", cat: "frames", qty: 0, hue: 10 },
];

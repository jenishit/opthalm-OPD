"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Glasses,
  Plus,
  User,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { Chip, Segmented } from "@/components/ui/ChartUi";
import { DiopterCell } from "@/components/ui/DiopterCell";
import { AxisCell } from "@/components/ui/AxisCell";
import { Art } from "@/components/ui/Art";
import { FemaleIcon } from "@/components/icons/FemaleIcon";
import { MaleIcon } from "@/components/icons/MaleIcon";
import { NonBinaryIcon } from "@/components/icons/NonBinaryIcon";
import { cn, setIn, fmtDate, addDays, today0, avatarAccent } from "@/lib/utils";
import { EYE, CONDS } from "@/types/eye-types";
import { MOCK_INVENTORY, MOCK_PATIENTS } from "./_components/mock-data";
import type { Gender, Patient, Urg } from "./_components/types";

/* ---------- registration wizard ---------- */
type Rx = {
  s: number | null;
  c: number | null;
  a: number | null;
  add: number | null;
};

interface WizardState {
  mode: "new" | "existing";
  ex: string;
  name: string;
  photo: string | null;
  age: number;
  g: Gender | null;
  conds: string[];
  rx: { od: Rx; os: Rx };
  items: string[];
}

const NAMES = [
  "Aarav Khadka",
  "Sabina Lama",
  "Roshan Pandey",
  "Pooja Neupane",
  "Sagar Bhandari",
  "Manisha Dahal",
];

const GENDER_OPTIONS: Array<
  [
    Gender,
    React.ComponentType<{ size?: number | string; className?: string }>,
    string,
  ]
> = [
  ["f", FemaleIcon, "Female"],
  ["m", MaleIcon, "Male"],
  ["o", NonBinaryIcon, "Other"],
];

const STEPS = [
  { label: "Patient", icon: User },
  { label: "Conditions", icon: ClipboardList },
  { label: "Prescription", icon: Glasses },
];

export default function NewPatientPage() {
  const router = useRouter();

  // No backend endpoint exists yet for this intake wizard — works against
  // local mock data, same as the rest of this page's clinical pickers.
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [inv, setInv] = useState(MOCK_INVENTORY);

  const [step, setStep] = useState(0);
  const [r, setR] = useState<WizardState>({
    mode: "new",
    ex: MOCK_PATIENTS[0].id,
    name: "",
    photo: null,
    age: 40,
    g: null,
    conds: [],
    rx: {
      od: { s: null, c: null, a: null, add: null },
      os: { s: null, c: null, a: null, add: null },
    },
    items: [],
  });
  const up = (p: Array<string | number>, v: unknown) =>
    setR((x) => setIn(x, p, v));
  const [over, setOver] = useState(false);

  const ex = patients.find((p) => p.id === r.ex);
  const photo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => up(["photo"], fr.result);
    fr.readAsDataURL(f);
  };
  const catalog = inv.filter(
    (i) => (i.cat === "frames" || i.cat === "contact") && i.qty > 0,
  );
  const addItem = (id: string) => {
    if (r.items.includes(id)) return;
    up(["items"], [...r.items, id]);
  };

  const save = () => {
    const id = `OPH-2026-${String(patients.length + 1).padStart(4, "0")}`;
    const base = r.mode === "existing" ? (ex ?? null) : null;
    const conds = r.conds.length ? r.conds : base ? base.conds : ["other"];
    const urg: Urg = conds.includes("glaucoma") ? "warn" : "ok";
    const np: Patient = {
      id: base ? base.id : id,
      name: base ? base.name : r.name || `Walk-in ${id.slice(-4)}`,
      age: base ? base.age : r.age,
      g: base ? base.g : r.g || "o",
      conds,
      urg,
      photo: r.photo || (base && base.photo) || null,
      visits: [
        {
          ago: 0,
          dx: conds[0],
          od: [r.rx.od.s, r.rx.od.c, r.rx.od.a],
          os: [r.rx.os.s, r.rx.os.c, r.rx.os.a],
          iop: [15, 15],
        },
        ...(base ? base.visits : []),
      ],
    };
    setPatients((ps) =>
      base ? ps.map((p) => (p.id === base!.id ? np : p)) : [np, ...ps],
    );
    setInv((items) =>
      items.map((i) =>
        r.items.includes(i.id) ? { ...i, qty: Math.max(0, i.qty - 1) } : i,
      ),
    );

    toast.success(
      `${np.name} registered${r.items.length ? ` · stock −${r.items.length}` : ""}`,
    );
    router.push("/patients");
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => {
          const Icon = i < step ? Check : s.icon;
          return (
            <React.Fragment key={s.label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold",
                  i === step
                    ? "bg-sage text-onacc border-sage"
                    : i < step
                      ? "bg-sage-soft text-sage border-sage-soft"
                      : "bg-card border-line text-mute",
                )}
              >
                <Icon className="size-4" />
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-5 border-t-2 border-strong" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="p-5">
        {step === 0 && (
          <div className="grid md:grid-cols-[180px_1fr] gap-6">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-36 h-36 rounded-full border-2 border-dashed border-strong bg-app grid place-items-center overflow-hidden hover:border-sage">
                {r.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo}
                    alt="Patient"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-mute gap-1">
                    <Camera className="size-9" />
                    <span className="text-xs">Tap to add photo</span>
                  </div>
                )}
              </div>
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="user"
                className="sr-only"
                onChange={photo}
              />
              <span className="text-sm text-sage font-semibold">
                {r.photo ? "Replace photo" : "Camera or gallery"}
              </span>
            </label>

            <div className="flex flex-col gap-5">
              <div>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Patient
                </span>
                <Segmented
                  value={r.mode}
                  onChange={(v) => up(["mode"], v)}
                  options={[
                    { value: "existing", label: "Existing", icon: Users },
                    { value: "new", label: "New", icon: UserPlus },
                  ]}
                />
                <div className="mt-3">
                  {r.mode === "existing" ? (
                    <select
                      id="exsel"
                      value={r.ex}
                      onChange={(e) => up(["ex"], e.target.value)}
                      className="w-full max-w-sm rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {NAMES.map((n) => (
                          <Chip
                            key={n}
                            on={r.name === n}
                            onClick={() => up(["name"], r.name === n ? "" : n)}
                          >
                            {n}
                          </Chip>
                        ))}
                      </div>
                      <input
                        id="newname"
                        type="text"
                        value={r.name}
                        onChange={(e) => up(["name"], e.target.value)}
                        placeholder="Or type a name (optional)"
                        className="max-w-sm rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
                      />
                    </div>
                  )}
                </div>
              </div>

              {r.mode === "new" && (
                <>
                  <div>
                    <div className="flex items-center justify-between max-w-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Age
                      </span>
                      <span className="font-mono text-2xl">{r.age}</span>
                    </div>
                    <input
                      id="age"
                      type="range"
                      min="1"
                      max="100"
                      value={r.age}
                      onChange={(e) => up(["age"], +e.target.value)}
                      className="max-w-sm w-full"
                      aria-label="Age"
                    />
                  </div>
                  <div>
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Gender
                    </span>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map(([v, Icon, l]) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={r.g === v}
                          onClick={() => up(["g"], v)}
                          className={cn(
                            "w-24 h-20 rounded-md border flex flex-col items-center justify-center gap-1 text-sm font-semibold",
                            r.g === v
                              ? "bg-sage text-onacc border-sage"
                              : "bg-card border-line hover:border-sage",
                          )}
                        >
                          <Icon size={26} />
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {r.mode === "existing" &&
                ex &&
                (() => {
                  const { hue, initials } = avatarAccent(ex.name);
                  return (
                    <div className="flex items-center gap-3 p-3 bg-app rounded-md border border-line">
                      <Avatar size="lg">
                        {ex.photo && (
                          <AvatarImage src={ex.photo} alt={ex.name} />
                        )}
                        <AvatarFallback
                          className="font-display font-semibold"
                          style={{
                            background: `hsl(${hue} 28% 82%)`,
                            color: "#2C3531",
                          }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{ex.name}</div>
                        <div className="text-sm text-mute">
                          {ex.age} yrs · last visit{" "}
                          {fmtDate(addDays(today0(), -ex.visits[0].ago))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Conditions · tap all that apply
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CONDS.map((c) => {
                const on = r.conds.includes(c.id);
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      up(
                        ["conds"],
                        on
                          ? r.conds.filter((x) => x !== c.id)
                          : [...r.conds, c.id],
                      )
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-md border transition-colors",
                      on
                        ? "bg-sage text-onacc border-sage"
                        : "bg-card border-line hover:border-sage",
                    )}
                  >
                    <Icon size={40} />
                    <span className="font-display font-semibold text-lg">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                try {
                  const d = JSON.parse(e.dataTransfer.getData("text/plain"));
                  if (d.kind === "item") addItem(d.id);
                } catch {
                  // not a draggable catalog item — ignore
                }
              }}
              className={cn(
                "rounded-md border-2 p-4 bg-app",
                over
                  ? "border-sage border-solid"
                  : "border-dashed border-strong",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-semibold">
                  Prescription card
                </h3>
                <span className="mono-label">Rx</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr className="mono-label">
                      <th></th>
                      <th className="pb-2">Sphere</th>
                      <th className="pb-2">Cylinder</th>
                      <th className="pb-2">Axis</th>
                      <th className="pb-2">Add</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["od", "os"] as const).map((e) => (
                      <tr key={e}>
                        <th className="font-display text-left pr-2">
                          {e.toUpperCase()}
                        </th>
                        <td className="p-1">
                          <DiopterCell
                            title={`Sphere · ${EYE[e]}`}
                            value={r.rx[e].s}
                            onChange={(v) => up(["rx", e, "s"], v)}
                          />
                        </td>
                        <td className="p-1">
                          <DiopterCell
                            title={`Cylinder · ${EYE[e]}`}
                            value={r.rx[e].c}
                            onChange={(v) => up(["rx", e, "c"], v)}
                          />
                        </td>
                        <td className="p-1">
                          <AxisCell
                            title={`Axis · ${EYE[e]}`}
                            value={r.rx[e].a}
                            onChange={(v) => up(["rx", e, "a"], v)}
                          />
                        </td>
                        <td className="p-1">
                          <DiopterCell
                            title={`Near add · ${EYE[e]}`}
                            value={r.rx[e].add}
                            defSign={1}
                            onChange={(v) => up(["rx", e, "add"], v)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Dispensed from inventory
                </span>
                {r.items.length ? (
                  <div className="flex flex-wrap gap-2">
                    {r.items.map((id) => {
                      const it = inv.find((i) => i.id === id);
                      if (!it) return null;
                      return (
                        <Chip
                          key={id}
                          on
                          onClick={() =>
                            up(
                              ["items"],
                              r.items.filter((x) => x !== id),
                            )
                          }
                          icon={X}
                        >
                          {it.name}
                        </Chip>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-mute">
                    Drag a lens or frame here, or tap Add on a card.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold mb-2">
                Lens and frame catalog
              </h3>
              {catalog.length ? (
                <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1">
                  {catalog.map((it) => (
                    <div
                      key={it.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "text/plain",
                          JSON.stringify({ kind: "item", id: it.id }),
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="border border-line rounded-md p-2 bg-card flex flex-col items-center gap-1 cursor-grab"
                    >
                      <Art cat={it.cat} hue={it.hue} size={54} />
                      <div className="text-xs font-semibold text-center leading-tight">
                        {it.name}
                      </div>
                      <div className="font-mono text-xs text-mute">
                        {it.qty} in stock
                      </div>
                      <Button
                        variant={
                          r.items.includes(it.id) ? "secondary" : "ghost"
                        }
                        size="xs"
                        onClick={() => addItem(it.id)}
                      >
                        {r.items.includes(it.id) ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Plus className="size-3.5" />
                        )}
                        {r.items.includes(it.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-3 py-10 px-4">
                  <div className="w-16 h-16 rounded-full bg-sage-soft text-sage grid place-items-center border border-line">
                    <Box className="size-7" />
                  </div>
                  <div className="font-display text-lg">Catalog is empty</div>
                  <p className="text-mute max-w-xs text-sm">
                    Add frames or lenses in Inventory first.
                  </p>
                  <Button onClick={() => router.push("/inventory")}>
                    <Plus className="size-4" />
                    Open inventory
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button size="lg" onClick={save}>
            <Check className="size-4" />
            Save patient
          </Button>
        )}
      </div>
    </div>
  );
}

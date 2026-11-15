"use client";

import { useState } from "react";

export function Toggle({
  defaultOn = false,
  on: controlledOn,
  onToggle,
  label,
}: {
  defaultOn?: boolean;
  on?: boolean;
  onToggle?: (next: boolean) => void;
  label: string;
}) {
  const [internalOn, setInternalOn] = useState(defaultOn);
  const on = controlledOn ?? internalOn;

  function handleClick() {
    const next = !on;
    if (controlledOn === undefined) setInternalOn(next);
    onToggle?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={handleClick}
      className={"flex h-[21px] w-[37px] shrink-0 items-center rounded-full p-[3px] transition-colors " + (on ? "bg-ok" : "bg-strong")}
    >
      <i className={"block size-[15px] rounded-full bg-white shadow-sm transition-transform " + (on ? "translate-x-4" : "translate-x-0")} />
    </button>
  );
}

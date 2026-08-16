"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, value, onChange, className }: OtpInputProps) {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]*$/.test(val)) return;

    const newValue = value.split("");

    // Handle paste
    if (val.length > 1) {
      const pasted = val.slice(0, length).split("");
      for (let i = 0; i < length; i++) {
        newValue[i] = pasted[i] || "";
      }
      onChange(newValue.join(""));
      const nextActive = Math.min(length - 1, val.length);
      setActiveInput(nextActive);
      inputRefs.current[nextActive]?.focus();
      return;
    }

    newValue[index] = val;
    onChange(newValue.join(""));

    if (val !== "") {
      if (index < length - 1) {
        setActiveInput(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={value.length === length ? 1 : length}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={() => setActiveInput(i)}
          className={cn(
            "h-12 w-10 sm:h-14 sm:w-12 rounded-2xl border border-input bg-card text-center text-xl font-semibold text-foreground shadow-organic-sm transition-all focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50",
            activeInput === i && "border-primary ring-3 ring-ring/50"
          )}
        />
      ))}
    </div>
  );
}

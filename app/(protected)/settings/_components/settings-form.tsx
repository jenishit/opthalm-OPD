"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, type Control, type FieldPath, type FieldValues, type Resolver, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FormField } from "@/components/forms";
import { ApiError } from "@/services/http";
import { Toggle } from "./Toggle";

/** Shared look for text controls on the settings screens. */
export const settingsInput =
  "min-h-[37px] w-full rounded-[7px] border border-line bg-card px-2.5 py-[9px] text-[11px] text-ink outline-none focus:border-sage aria-invalid:border-destructive";

const labelCls = "text-[10px] font-semibold text-mute";

/** A labelled settings row: RHF Controller + Field + error, in the settings tab styling. */
export function SettingsField<T extends FieldValues, N extends FieldPath<T>>(props: Omit<React.ComponentProps<typeof FormField<T, N>>, "labelClassName">) {
  return <FormField {...props} labelClassName={labelCls} className={"gap-[7px] " + (props.className ?? "")} />;
}

/** On/off switch bound to a boolean form field. */
export function ToggleField<T extends FieldValues>({ control, name, label }: { control: Control<T>; name: FieldPath<T>; label: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <Toggle on={Boolean(field.value)} onToggle={field.onChange} label={label} />}
    />
  );
}

export function SettingsLoading({ text }: { text: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-[11px] text-mute">
      <Loader2 size={15} className="animate-spin" /> {text}
    </div>
  );
}

/**
 * Load → edit → save lifecycle shared by the settings tabs: fetches the current
 * values into the form, validates with the zod resolver on save, and tracks the
 * last-saved time.
 */
export function useSettingsForm<V extends FieldValues>({
  resolver,
  defaults,
  load,
  save,
  noun,
}: {
  resolver: Resolver<V>;
  /** Used until the real values arrive. */
  defaults: V;
  load: () => Promise<V>;
  save: (values: V) => Promise<V | void>;
  /** e.g. "practice settings" — used in toast messages. */
  noun: string;
}): { form: UseFormReturn<V>; loading: boolean; lastSaved: string | null; onSave: () => void; saving: boolean } {
  const form = useForm<V>({ resolver, defaultValues: defaults as never });
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { reset } = form;

  useEffect(() => {
    let active = true;
    load()
      .then((v) => {
        if (active) reset(v);
      })
      .catch((error) => {
        console.error(`Failed to load ${noun}`, error);
        toast.error(`Failed to load ${noun}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // load/noun are stable per tab; reset is stable from RHF.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = form.handleSubmit(
    async (values) => {
      try {
        const saved = await save(values);
        reset(saved ?? values);
        setLastSaved(new Date().toISOString());
        toast.success(`${noun[0].toUpperCase()}${noun.slice(1)} saved`);
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : `Failed to save ${noun}`);
      }
    },
    () => toast.error("Fix the highlighted fields and try again"),
  );

  return { form, loading, lastSaved, onSave: () => void onSave(), saving: form.formState.isSubmitting };
}

"use client";

import { useId } from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/shadcn/field";

interface RenderArgs<T extends FieldValues, N extends FieldPath<T>> {
  /** value / onChange / onBlur / name / ref — spread onto the control. */
  field: ControllerRenderProps<T, N>;
  /** Unique id; also set as the label's `htmlFor`. */
  id: string;
  invalid: boolean;
}

/**
 * One labelled form row: RHF `Controller` + shadcn `Field`/`FieldLabel`/`FieldError`.
 * Handles the label↔control id link, `data-invalid` styling and the error message,
 * so each form only declares the control.
 *
 *   <FormField control={control} name="email" label="Email">
 *     {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} />}
 *   </FormField>
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  className,
  labelClassName,
  children,
}: {
  control: Control<T>;
  name: N;
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: (args: RenderArgs<T, N>) => React.ReactNode;
}) {
  const uid = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={`${uid}-${name}`} className={labelClassName}>{label}</FieldLabel>
          {children({ field, id: `${uid}-${name}`, invalid: fieldState.invalid })}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { FormField, NativeSelect } from "@/components/forms";
import { ROLE_LABEL } from "@/lib/permissions";
import { assignableRole, inviteMemberSchema, type InviteMemberForm } from "@/schemas/team-schema";
import { createUser } from "@/services/admin-services";
import { ApiError } from "@/services/http";
import { toBackendRoleName } from "./role-name";

const DEFAULTS: InviteMemberForm = { first_name: "", last_name: "", email: "", phone: "", role: "doctor", password: "" };

export function InviteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { control, handleSubmit, reset, formState } = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  const close = (next: boolean) => {
    if (!next) reset(DEFAULTS);
    onOpenChange(next);
  };

  async function onSubmit(v: InviteMemberForm) {
    try {
      await createUser({
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email,
        phone: v.phone || undefined,
        password: v.password,
        role_name: toBackendRoleName(v.role),
      });
      toast.success("Team member added");
      close(false);
      onCreated();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to add team member");
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogTitle>Add team member</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={control} name="first_name" label="First name">
              {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} autoComplete="off" />}
            </FormField>
            <FormField control={control} name="last_name" label="Last name">
              {({ field, id, invalid }) => <Input {...field} id={id} aria-invalid={invalid} autoComplete="off" />}
            </FormField>
          </div>
          <FormField control={control} name="email" label="Email">
            {({ field, id, invalid }) => <Input {...field} id={id} type="email" aria-invalid={invalid} autoComplete="off" />}
          </FormField>
          <FormField control={control} name="phone" label="Phone (optional)">
            {({ field, id, invalid }) => <Input {...field} id={id} type="tel" aria-invalid={invalid} autoComplete="off" />}
          </FormField>
          <FormField control={control} name="role" label="Role">
            {({ field, id, invalid }) => (
              <NativeSelect {...field} id={id} aria-invalid={invalid}>
                {assignableRole.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField control={control} name="password" label="Temporary password" description="At least 8 characters. Share it securely and ask them to change it.">
            {({ field, id, invalid }) => <Input {...field} id={id} type="password" aria-invalid={invalid} autoComplete="new-password" />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

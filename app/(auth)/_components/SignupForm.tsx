"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { FormField } from "@/components/forms";
import { signupSchema, type SignupForm as SignupValues } from "@/schemas/signup-schema";
import { signup } from "@/services/auth-services";
import { ApiError } from "@/services/http";

const inputCls =
  "h-12 w-full rounded-xl border border-strong bg-card px-4 text-[0.95rem] font-medium text-ink " +
  "placeholder:text-mute outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30";
const labelCls = "text-[0.85rem] font-semibold text-ink";

export function SignupForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", confirm_password: "" },
  });

  async function onSubmit(v: SignupValues) {
    try {
      await signup({ email: v.email, password: v.password });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError("email", { type: "server", message: "This email is already registered" });
      } else if (error instanceof ApiError && error.status === 429) {
        toast.error("Too many sign-up attempts. Please try again later.");
      } else {
        toast.error(error instanceof ApiError ? error.message : "Couldn't create the account");
      }
      return;
    }

    // The account exists now — sign in through the normal session so the
    // protected setup wizard can read and update the new clinic.
    const result = await signIn("credentials", { email: v.email, password: v.password, remember: "false", redirect: false });
    if (result?.error) {
      toast.success("Account created. Please sign in to finish setup.");
      router.push("/login");
      return;
    }
    toast.success("Account created. Let's set up your clinic.");
    router.push("/setup");
    router.refresh();
  }

  return (
    <div className="w-full max-w-[28rem]">
      <h2 className="font-brand-serif text-[2.4rem] font-normal text-ink">Create your account</h2>
      <p className="mb-6 mt-2 text-[0.95rem] text-ink">
        Start with your email and a password. Next, a short wizard collects your clinic details and your name.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField control={control} name="email" label="Work email" labelClassName={labelCls}>
          {({ field, id, invalid }) => (
            <Input {...field} id={id} type="email" aria-invalid={invalid} autoComplete="email" className={inputCls} />
          )}
        </FormField>
        <FormField
          control={control}
          name="password"
          label="Password"
          description="At least 8 characters, with a letter and a number."
          labelClassName={labelCls}
        >
          {({ field, id, invalid }) => (
            <div className="relative">
              <Input
                {...field}
                id={id}
                type={show ? "text" : "password"}
                aria-invalid={invalid}
                autoComplete="new-password"
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-ink hover:bg-muted"
              >
                {show ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
          )}
        </FormField>
        <FormField control={control} name="confirm_password" label="Confirm password" labelClassName={labelCls}>
          {({ field, id, invalid }) => (
            <Input
              {...field}
              id={id}
              type={show ? "text" : "password"}
              aria-invalid={invalid}
              autoComplete="new-password"
              className={inputCls}
            />
          )}
        </FormField>

        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="mt-1 h-[3.2rem] rounded-xl bg-sage text-base font-bold text-primary-foreground transition hover:bg-sagehover disabled:opacity-60"
        >
          {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {formState.isSubmitting ? "Creating your account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[0.9rem] text-ink">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-sage hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

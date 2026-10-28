"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeClosed, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/login-schema";
import { Field, FieldError, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Button } from "@/components/shadcn/button";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

const inputCls =
  "h-[3.25rem] w-full rounded-xl border border-[#CFCABD] bg-white px-4 text-[0.95rem] font-medium text-[#0B2545] " +
  "placeholder:text-[#5F6B73] outline-none transition focus:border-[#1B6B66] focus:ring-2 focus:ring-[#1B6B66]/30";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const handleLogin = async (data: LoginPayload) => {
    if (!data.email || !data.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      remember: data.remember ? "true" : "false",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid Credentials");
      return;
    }
    router.push("/queue");

    router.refresh();
  };

  return (
    <div className="w-full max-w-[25rem]">
      <h2 className="font-brand-serif text-[2.6rem] font-normal text-[#0B2545]">
        Welcome back
      </h2>
      <p className="mb-8 mt-2 text-[0.95rem] text-[#55616A]">
        Sign in to your OpthalmOK workspace.
      </p>

      <form
        onSubmit={loginForm.handleSubmit(handleLogin)}
        className="flex flex-col gap-5"
        noValidate
      >
        <Controller
          control={loginForm.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <Label className="text-[0.85rem] font-semibold text-[#0B2545]">
                Email
              </Label>
              <Input
                {...field}
                placeholder="admin@company.com"
                className={`${inputCls} pr-12`}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={loginForm.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="text-[0.85rem] font-semibold text-[#0B2545]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[0.85rem] font-semibold text-[#1B6B66] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className={`${inputCls} pr-12`}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#55616A] hover:text-[#0B2545] bg-seconary border-0 hover:bg-white/10"
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </div>
            </Field>
          )}
        />

        <Controller
          control={loginForm.control}
          name="remember"
          render={({ field }) => (
            <Label className="flex min-h-11 items-center gap-3 text-[0.9rem] text-[#33404A]">
              <Input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-[1.15rem] w-[1.15rem] accent-[#134A4C] cursor-pointer"
              />
              Keep me signed in on this device
            </Label>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-[3.4rem] rounded-xl bg-[#0B2545] text-base font-bold tracking-[0.02em] text-[#F3EFE6] transition hover:bg-[#134A4C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B6B66] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4 text-[0.8rem] text-[#55616A]">
        <span className="h-px flex-1 bg-[#D8D3C6]" />
        or
        <span className="h-px flex-1 bg-[#D8D3C6]" />
      </div>

      <p className="mt-8 text-center text-[0.9rem] text-[#55616A]">
        New to OpthalmOK?{" "}
        <Link
          href="/request-access"
          className="font-semibold text-[#1B6B66] hover:underline"
        >
          Request access
        </Link>
      </p>
    </div>
  );
}

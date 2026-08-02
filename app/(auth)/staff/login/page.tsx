"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { staffLoginSchema, type StaffLoginValues } from "@/schemas/auth";
import { login, getMyProfile } from "@/services/auth";
import { ApiError } from "@/services/http";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Staff } from "@/lib/schemas/shared.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const STAFF_ROLES: Staff["role"][] = ["doctor", "optometrist", "receptionist"];

function toStaffRole(roleName: string): Staff["role"] {
  const normalized = roleName.toLowerCase().replace(/^role_/, "");
  return STAFF_ROLES.find((r) => normalized.includes(r)) ?? "receptionist";
}

export default function StaffLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const loginStaff = useAuthStore((state) => state.loginStaff);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginValues>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (values: StaffLoginValues) => {
    setIsLoading(true);
    try {
      const session = await login(values);
      setAccessToken(session.access_token);
      const profile = await getMyProfile();
      loginStaff({
        id: profile.user_id,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        role: toStaffRole(profile.role_name),
        phone: profile.phone ?? undefined,
        email: profile.email,
      });
      router.push("/staff/queue");
    } catch (error) {
      const message = error instanceof ApiError ? error.messages.join(", ") : "Sign-in failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="organic-blob absolute top-10 right-0 h-64 w-64 bg-primary/10" aria-hidden />
      <div className="organic-blob absolute bottom-10 left-0 h-56 w-56 bg-accent/10" aria-hidden />

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="items-center space-y-1 text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Eye className="size-6" />
          </div>
          <CardTitle className="font-display text-2xl font-medium tracking-tight">Staff sign in</CardTitle>
          <CardDescription>Sign in with your clinic account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" {...register("email")} disabled={isLoading} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/60 px-6 py-4 text-sm text-muted-foreground">
          Accounts are created by the clinic administrator.
        </CardFooter>
      </Card>
    </div>
  );
}

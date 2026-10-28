"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Phone, Eye } from "lucide-react";

import { sendOtp } from "@/services/portal-services";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/card";

const loginSchema = z.object({
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { code } = await sendOtp({ phone: data.phone });
      // In a real app we'd save the phone number in a temporary state/cookie
      // so the verify page knows what number we're verifying.
      // For this mock we can pass it as a query param or use a session store
      sessionStorage.setItem("verify_phone", data.phone);
      toast.success(`Your OTP is ${code}`, { description: "Shown here until SMS is connected", duration: 20000 });
      router.push("/portal/verify");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center p-4">

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="items-center space-y-1 text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Eye className="size-6" />
          </div>
          <CardTitle className="font-display text-2xl font-medium tracking-tight">Patient Login</CardTitle>
          <CardDescription>
            Enter your registered phone number to access your records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  placeholder="e.g. 9876543210"
                  className="pl-9"
                  {...register("phone")}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm font-medium text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-border/60 px-6 py-4">
          <div className="text-sm text-center text-muted-foreground">
            Having trouble logging in? <br/>
            Please contact the clinic reception.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


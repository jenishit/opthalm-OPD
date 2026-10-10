"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { verifyOtp } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { OtpInput } from "@/components/portal/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function PortalVerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loginPortalPatient = useAuthStore((state) => state.loginPortalPatient);

  useEffect(() => {
    // In a real app we might use cookies or a robust session solution
    const storedPhone = sessionStorage.getItem("verify_phone");
    if (!storedPhone) {
      router.replace("/portal/login");
    } else {
      setPhone(storedPhone);
    }
  }, [router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    if (!phone) return;

    setIsLoading(true);
    try {
      const result = await verifyOtp({ phone, code: otp });
      loginPortalPatient(result.patient, "otp", result.sessionToken);
      toast.success("Successfully logged in");
      router.push("/portal");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) return null; // Prevent hydration flash while redirecting

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center p-4">

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-2xl font-medium tracking-tight">Verify Identity</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit code to <br />
            <span className="font-semibold text-foreground">{phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-4">
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={isLoading || otp.length !== 6}
            onClick={handleVerify}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/60 py-4">
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/portal/login">
              <ArrowLeft className="h-4 w-4" />
              Change Phone Number
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

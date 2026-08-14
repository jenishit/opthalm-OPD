"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { verifyPatientToken } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

const dobSchema = z.object({
  dob: z.date({
    error: "Date of birth is required.",
  }),
});

interface DobVerificationProps {
  token: string;
}

export function DobVerification({ token }: DobVerificationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const loginPortalPatient = useAuthStore((state) => state.loginPortalPatient);

  const { handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof dobSchema>>({
    resolver: zodResolver(dobSchema),
  });

  async function onSubmit(data: z.infer<typeof dobSchema>) {
    setIsLoading(true);
    try {
      const formattedDob = format(data.dob, "yyyy-MM-dd");
      const result = await verifyPatientToken({ token, date_of_birth: formattedDob });

      loginPortalPatient(result.patient, "qr", token);
      toast.success("Identity verified successfully");
      router.push("/portal");
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please check the date of birth.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Label>Date of Birth</Label>
        <Controller
          control={control}
          name="dob"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger>
                <div
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2 text-sm shadow-organic-sm hover:bg-muted",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  defaultMonth={field.value || new Date(2000, 0, 1)}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <p className="text-xs text-muted-foreground">
          We need to verify your date of birth for security purposes.
        </p>
        {errors.dob && (
          <p className="text-sm text-destructive font-medium">{errors.dob.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Identity"
        )}
      </Button>
    </form>
  );
}

import { z } from "zod";

export const otpRequestSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only digits"),
});

export const otpVerifySchema = z.object({
  phone: z.string(),
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export const tokenVerifySchema = z.object({
  token: z.string().min(1),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

export type OtpRequest = z.infer<typeof otpRequestSchema>;
export type OtpVerify = z.infer<typeof otpVerifySchema>;
export type TokenVerify = z.infer<typeof tokenVerifySchema>;

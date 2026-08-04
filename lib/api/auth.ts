import { delay } from "@/lib/mock/delay";
import { mockAccessTokens, mockOtpStore } from "@/lib/mock/data";
import { getPatientByPhone, getPatient } from "./patients.mock";
import type { Patient } from "@/lib/schemas/patient.schema";
import type { OtpRequest, OtpVerify, TokenVerify } from "@/lib/schemas/auth.schema";
import type { PatientAccessToken } from "@/lib/schemas/shared.schema";

let tokens = [...mockAccessTokens];

// â”€â”€ OTP Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function sendOtp(data: OtpRequest): Promise<{ success: boolean; message: string; code: string }> {
  await delay(600);
  
  const patient = await getPatientByPhone(data.phone);
  if (!patient) {
    // Return success anyway to prevent number enumeration, or could throw error if preferred.
    // For this clinic app, let's say the phone must be registered first.
    throw new Error("Phone number not registered. Please visit the clinic to register.");
  }

  // Generate a random 6-digit code (or fixed for testing)
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  mockOtpStore[data.phone] = { code, expiry, verified: false };
  
  console.log(`[MOCK SMS] OTP for ${data.phone} is ${code}`);
  
  return { success: true, message: "OTP sent successfully", code };
}

export async function verifyOtp(data: OtpVerify): Promise<{ patient: Patient; sessionToken: string }> {
  await delay(800);
  
  const otpRecord = mockOtpStore[data.phone];
  if (!otpRecord) throw new Error("No OTP request found for this number");
  if (otpRecord.code !== data.code) throw new Error("Invalid OTP code");
  if (new Date() > otpRecord.expiry) throw new Error("OTP has expired");

  otpRecord.verified = true;
  
  const patient = await getPatientByPhone(data.phone);
  if (!patient) throw new Error("Patient not found");

  return { patient, sessionToken: `sess_${Date.now()}` };
}

// â”€â”€ QR Token Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function verifyPatientToken(data: TokenVerify): Promise<{ patient: Patient; sessionToken: string }> {
  await delay(500);
  
  const tokenRecord = tokens.find((t) => t.token === data.token && !t.revoked);
  if (!tokenRecord) throw new Error("Invalid or expired token");

  const patient = await getPatient(tokenRecord.patient_id);
  if (!patient) throw new Error("Patient not found");

  // Secondary verification: DOB
  if (patient.date_of_birth !== data.date_of_birth) {
    throw new Error("Verification failed. Please check the date of birth.");
  }

  return { patient, sessionToken: `sess_${Date.now()}` };
}

// â”€â”€ Token Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function generatePatientToken(patientId: string): Promise<PatientAccessToken> {
  await delay();
  const newToken: PatientAccessToken = {
    id: `at${Date.now()}`,
    patient_id: patientId,
    token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    revoked: false,
    created_at: new Date().toISOString(),
  };
  tokens = [...tokens, newToken];
  return newToken;
}

export async function revokePatientToken(tokenId: string): Promise<void> {
  await delay();
  const idx = tokens.findIndex((t) => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].revoked = true;
  }
}



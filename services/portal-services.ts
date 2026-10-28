import { delay } from "@/lib/mock/delay";
import { mockAccessTokens, mockOtpStore, mockPatients, mockVisits } from "@/lib/mock/data";
import type { Patient } from "@/schemas/patient-schema";
import type { OtpRequest, OtpVerify, TokenVerify } from "@/schemas/auth-schema";
import type { PatientAccessToken } from "@/schemas/shared-schema";
import type { Visit, VisitStatus } from "@/schemas/visit-schema";
import type { Treatment } from "@/schemas/treatment-schema";
import type { RefractionReading } from "@/schemas/refraction-schema";

// Everything in this file backs the patient-facing /portal/* routes. Patients
// authenticate without a staff bearer token, and none of these resources
// (patient lookup, visit history, glasses history) have public endpoints yet
// — kept separate from the staff-side services since both the data source
// and the auth model differ.

// ── Local patient lookup (portal auth only) ─────────────────────────────────

const localPatients = [...mockPatients];

function findPatientByPhone(phone: string): Patient | null {
  return localPatients.find((p) => p.phone === phone) ?? null;
}

function findPatientById(id: string): Patient | null {
  return localPatients.find((p) => p.id === id) ?? null;
}

// ── OTP flow ─────────────────────────────────────────────────────────────────

export async function sendOtp(
  data: OtpRequest
): Promise<{ success: boolean; message: string; code: string }> {
  await delay(600);

  const patient = findPatientByPhone(data.phone);
  if (!patient) {
    throw new Error("Phone number not registered. Please visit the clinic to register.");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  mockOtpStore[data.phone] = { code, expiry, verified: false };

  console.log(`[MOCK SMS] OTP for ${data.phone} is ${code}`);

  return { success: true, message: "OTP sent successfully", code };
}

export async function verifyOtp(
  data: OtpVerify
): Promise<{ patient: Patient; sessionToken: string }> {
  await delay(800);

  const otpRecord = mockOtpStore[data.phone];
  if (!otpRecord) throw new Error("No OTP request found for this number");
  if (otpRecord.code !== data.code) throw new Error("Invalid OTP code");
  if (new Date() > otpRecord.expiry) throw new Error("OTP has expired");

  otpRecord.verified = true;

  const patient = findPatientByPhone(data.phone);
  if (!patient) throw new Error("Patient not found");

  return { patient, sessionToken: `sess_${Date.now()}` };
}

// ── QR token flow ────────────────────────────────────────────────────────────

let tokens = [...mockAccessTokens];

export async function verifyPatientToken(
  data: TokenVerify
): Promise<{ patient: Patient; sessionToken: string }> {
  await delay(500);

  const tokenRecord = tokens.find((t) => t.token === data.token && !t.revoked);
  if (!tokenRecord) throw new Error("Invalid or expired token");

  const patient = findPatientById(tokenRecord.patient_id);
  if (!patient) throw new Error("Patient not found");

  // Secondary verification: DOB
  if (patient.date_of_birth !== data.date_of_birth) {
    throw new Error("Verification failed. Please check the date of birth.");
  }

  return { patient, sessionToken: `sess_${Date.now()}` };
}

export async function generatePatientToken(patientId: string): Promise<PatientAccessToken> {
  await delay();
  const newToken: PatientAccessToken = {
    id: `at${Date.now()}`,
    patient_id: patientId,
    token:
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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

// ── Visit history (no public backend endpoint yet) ──────────────────────────

const portalVisits = [...mockVisits];

export async function getVisits(filters?: {
  date?: string;
  status?: VisitStatus;
  patient_id?: string;
}): Promise<Visit[]> {
  await delay();
  let result = portalVisits;
  if (filters?.date) result = result.filter((v) => v.visit_date === filters.date);
  if (filters?.status) result = result.filter((v) => v.status === filters.status);
  if (filters?.patient_id) result = result.filter((v) => v.patient_id === filters.patient_id);
  return result;
}

export async function getVisit(id: string): Promise<Visit | null> {
  await delay();
  return portalVisits.find((v) => v.id === id) ?? null;
}

// ── Glasses history / treatments (no public backend endpoint yet) ───────────

export async function getPatientRefractions(_patientId: string): Promise<RefractionReading[]> {
  await delay();
  return [];
}

export async function getTreatments(_visitId: string): Promise<Treatment[]> {
  await delay();
  return [];
}

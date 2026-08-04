import { delay } from "@/lib/mock/delay";
import type { RefractionReading } from "@/lib/schemas/refraction.schema";

export async function getPatientRefractions(patientId: string): Promise<RefractionReading[]> {
  await delay();
  return []; // Mock empty for now
}

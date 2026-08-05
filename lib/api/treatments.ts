import { delay } from "@/lib/mock/delay";
import type { Treatment } from "@/lib/schemas/treatment.schema";

export async function getTreatments(visitId: string): Promise<Treatment[]> {
  await delay();
  return []; // Mock empty for now
}

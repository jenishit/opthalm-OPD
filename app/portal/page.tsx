"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { getVisits } from "@/lib/api/visits.mock";
import type { Visit } from "@/lib/schemas/visit.schema";
import { VisitHistoryList } from "@/components/portal/visit-history-list";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortalDashboard() {
  const router = useRouter();
  const patient = useAuthStore((state) => state.portalPatient);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patient) {
      router.replace("/portal/login");
      return;
    }

    const fetchVisits = async () => {
      try {
        const data = await getVisits({ patient_id: patient.id });
        setVisits(data);
      } catch (error) {
        console.error("Failed to fetch visits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [patient, router]);

  if (!patient) return null;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto w-full pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Welcome, {patient.first_name}
          </h1>
          <p className="text-muted-foreground">
            View your clinic visits and medical records.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/portal/glasses-history">
            View Glasses History
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        <h2 className="font-display text-xl font-medium mb-4 text-foreground">Your Visits</h2>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <VisitHistoryList visits={visits} />
        )}
      </div>
    </div>
  );
}


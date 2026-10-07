"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import type { RefractionReading } from "@/lib/schemas/refraction.schema";
import { getPatientRefractions } from "@/lib/api/refraction";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function GlassesHistoryTable() {
  const patient = useAuthStore((state) => state.portalPatient);
  const [readings, setReadings] = useState<RefractionReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;

    const fetchHistory = async () => {
      try {
        // In a real app, this API would return all final_rx readings for a patient
        // sorted chronologically
        const data = await getPatientRefractions(patient.id);
        // Filter only final_rx
        const finalRxs = data.filter((r: RefractionReading) => r.stage === "final_rx");

        // Sort descending by date (using created_at as proxy for visit date here)
        finalRxs.sort((a: RefractionReading, b: RefractionReading) => {
           const d1 = a.created_at ? new Date(a.created_at).getTime() : 0;
           const d2 = b.created_at ? new Date(b.created_at).getTime() : 0;
           return d2 - d1;
        });

        setReadings(finalRxs);
      } catch (error) {
        console.error("Failed to fetch glasses history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [patient]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 border border-border/60 rounded-2xl bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/40 text-muted-foreground">
        No glasses prescriptions found in your medical record.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead>Eye</TableHead>
            <TableHead className="text-center">Sph</TableHead>
            <TableHead className="text-center">Cyl</TableHead>
            <TableHead className="text-center">Axis</TableHead>
            <TableHead className="text-center">Add</TableHead>
            <TableHead className="text-center">VA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {reading.created_at ? format(new Date(reading.created_at), "MMM d, yyyy") : "Unknown"}
              </TableCell>
              <TableCell>
                <Badge variant={reading.eye === "OD" ? "default" : "secondary"}>
                  {reading.eye === "OD" ? "Right (OD)" : "Left (OS)"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{reading.sphere || "-"}</TableCell>
              <TableCell className="text-center">{reading.cylinder || "-"}</TableCell>
              <TableCell className="text-center">{reading.axis || "-"}</TableCell>
              <TableCell className="text-center">{reading.add_power || "-"}</TableCell>
              <TableCell className="text-center">{reading.va || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

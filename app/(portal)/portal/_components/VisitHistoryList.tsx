"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ChevronRight, Stethoscope } from "lucide-react";
import type { Visit } from "@/schemas/visit-schema";
import { Card, CardContent } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";

export function VisitHistoryList({ visits }: { visits: Visit[] }) {
  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-muted/40">
        <div className="rounded-full bg-muted p-3">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">No visits found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          We couldn&apos;t find any clinic visits for your account. If you believe this is an error, please contact the clinic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <Link key={visit.id} href={`/portal/visits/${visit.id}`}>
          <Card className="mb-4 cursor-pointer transition-all hover:border-primary/30">
            <CardContent className="p-0">
              <div className="flex items-center p-4 sm:p-6">
                <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>

                <div className="ml-0 sm:ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-medium text-lg text-foreground">
                      {format(new Date(visit.visit_date), "MMMM d, yyyy")}
                    </h3>
                    <Badge variant={visit.status === "completed" ? "default" : "secondary"}>
                      {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                    <span>Dr. {visit.examined_by || "Assigned Doctor"}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate max-w-[200px] sm:max-w-md">
                      {visit.chief_complaint || "Routine checkup"}
                    </span>
                  </div>
                </div>

                <div className="ml-4 shrink-0 text-muted-foreground">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

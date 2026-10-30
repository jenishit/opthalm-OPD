"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/shadcn/table";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { usePrescriptionStore } from "./_components/store";
import { LENS_TYPE_LABEL } from "./_components/types";
import { useAuthStore } from "@/stores/authStore";
import { isReadOnly } from "@/lib/permissions";

export default function PrescriptionsPage() {
  const router = useRouter();
  const prescriptions = usePrescriptionStore((s) => s.prescriptions);
  const staffUser = useAuthStore((s) => s.staffUser);
  const readOnly = isReadOnly(staffUser?.role, "/prescriptions");

  return (
    <>
      <SectionHeading
        eyebrow="REFRACTION & OPTICAL CARE"
        title="Spectacle prescriptions"
        description={
          readOnly
            ? "Accurate, readable prescriptions connected to the patient record and optical order. View only."
            : "Accurate, readable prescriptions connected to the patient record and optical order."
        }
        actions={
          !readOnly && (
            <Button onClick={() => router.push("/prescriptions/new")}>
              <Plus className="size-4" />
              Create prescription
            </Button>
          )
        }
      />

      <Card className="p-0 overflow-hidden">
        {prescriptions.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No prescriptions yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Rx number</TableHead>
                <TableHead>Lens type</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => (
                <TableRow key={rx.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link href={`/prescriptions/${rx.id}`} className="flex items-center gap-2 px-4 py-3 font-medium text-foreground">
                      {rx.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{rx.prescriptionNumber}</TableCell>
                  <TableCell>{LENS_TYPE_LABEL[rx.lensType]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(rx.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rx.status === "issued" ? "default" : "secondary"}>
                      {rx.status === "issued" ? "Issued" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/prescriptions/${rx.id}`} aria-label={`Open ${rx.patientName}'s prescription`}>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}

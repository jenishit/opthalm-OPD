"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/shadcn/table";
import { OpsNotice } from "@/components/ui/OpsStat";
import { Pager } from "@/components/ui/Pager";
import { usePagination } from "@/lib/hooks/use-pagination";
import { isReadOnly } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { LENS_TYPE_LABEL } from "./_components/types";
import { usePrescriptions } from "./_components/usePrescriptions";

export default function PrescriptionsPage() {
  const router = useRouter();
  const { list, loading, error, reload } = usePrescriptions();
  const staffUser = useAuthStore((s) => s.staffUser);
  const readOnly = isReadOnly(staffUser?.role, "/prescriptions");
  const pg = usePagination(list, "all", 25);

  return (
    <>
      <SectionHeading
        eyebrow="REFRACTION & OPTICAL CARE"
        title="Spectacle prescriptions"
        description={
          readOnly
            ? "Final refractions from completed examinations. View only."
            : "Final refractions from completed examinations, ready to print or hand to the optical team."
        }
        actions={
          !readOnly && (
            <Button variant="secondary" onClick={() => router.push("/prescriptions/new")}>
              <Plus className="size-4" />
              Manual prescription
            </Button>
          )
        }
      />

      <Card className="overflow-hidden p-0">
        {loading ? (
          <OpsNotice kind="loading" text="Loading prescriptions from recent examinations…" />
        ) : error && list.length === 0 ? (
          <OpsNotice kind="error" text={error} onRetry={reload} />
        ) : list.length === 0 ? (
          <OpsNotice kind="empty" text="No prescriptions yet. A prescription appears here once an examination is completed with a final refraction." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Rx number</TableHead>
                  <TableHead>Lens type</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pg.pageItems.map((rx) => (
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
                      <Badge variant={rx.source === "visit" ? "default" : "secondary"} title={rx.source === "visit" ? "Issued from a completed examination" : "Created by hand in this browser only — not saved to the server"}>
                        {rx.source === "visit" ? "Examination" : "Local only"}
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
            <Pager page={pg.page} pageCount={pg.pageCount} pageSize={pg.pageSize} total={pg.total} onPage={pg.setPage} onPageSize={pg.setPageSize} noun="prescriptions" />
          </>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Showing prescriptions from the 60 most recent completed visits.</p>
    </>
  );
}

import { GlassesHistoryTable } from "@/components/portal/glasses-history-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GlassesHistoryPage() {
  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground">
          <Link href="/portal">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Glasses Prescription History
        </h1>
        <p className="text-muted-foreground mt-1">
          Track changes to your eye power over time.
        </p>
      </div>

      <div className="mt-4">
        <GlassesHistoryTable />
      </div>
    </div>
  );
}

import { SimplifiedVisitDetail } from "@/components/portal/simplified-visit-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PortalVisitDetailPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const visitId = (await params).visitId;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto w-full pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground">
          <Link href="/portal">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <SimplifiedVisitDetail visitId={visitId} />
    </div>
  );
}

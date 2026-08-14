import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DobVerification } from "@/components/portal/dob-verification";

export default async function QRVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const token = (await params).token;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl tracking-tight">Clinic Access Portal</CardTitle>
          <CardDescription>
            You are accessing records via a secure link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DobVerification token={token} />
        </CardContent>
      </Card>
    </div>
  );
}

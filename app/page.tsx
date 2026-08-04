import Link from "next/link";
import { Eye, Stethoscope, UserRound, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        className="organic-blob absolute -top-24 -left-32 h-96 w-96 bg-primary/10"
        aria-hidden
      />
      <div
        className="organic-blob absolute top-1/3 -right-24 h-80 w-80 bg-accent/10"
        aria-hidden
      />
      <div
        className="organic-blob absolute -bottom-32 left-1/4 h-72 w-72 bg-status-examining/10"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Eye className="size-4" />
            EyeClinic OPD
          </div>
          <h1 className="font-display max-w-2xl text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
            Thoughtful eye care, organized simply
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            One calm place for your clinic&apos;s queue, records, and
            prescriptions — and for patients to look back on their own visits.
          </p>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          <Card className="group border-none p-1 transition-transform hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope className="size-5" />
              </div>
              <CardTitle className="text-lg">Staff</CardTitle>
              <CardDescription>
                Run the queue, examine patients, and manage records.
              </CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter className="border-none bg-transparent pt-0">
              <Button asChild className="w-full">
                <Link href="/staff/queue">
                  Open staff console
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="group border-none p-1 transition-transform hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <UserRound className="size-5" />
              </div>
              <CardTitle className="text-lg">Patient portal</CardTitle>
              <CardDescription>
                View your visit history and glasses prescriptions.
              </CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter className="border-none bg-transparent pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href="/portal/login">
                  Sign in to your records
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

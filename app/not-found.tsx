import Link from "next/link";

import { Button } from "@/components/shadcn/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find what you were looking for.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/staff">Staff area</Link>
        </Button>
      </div>
    </div>
  );
}

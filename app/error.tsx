"use client";

// Root error boundary. Must be a client component per Next.js convention.
import { useEffect } from "react";

import { Button } from "@/components/shadcn/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          {error.message || "An unexpected error occurred."}
          {error.digest ? ` (id: ${error.digest})` : ""}
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}

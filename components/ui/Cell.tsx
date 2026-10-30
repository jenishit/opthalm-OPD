"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";

/** Tap-to-enter dashed value cell that opens a dialog — backs DiopterCell/AxisCell. No existing design-system component covers this. */
export function Cell({
  title,
  display,
  abn,
  children,
  className,
}: {
  title: string;
  display: React.ReactNode;
  abn?: boolean;
  children: (close: () => void) => React.ReactNode;
  className?: string;
}) {
  const [o, setO] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setO(true)}
        className={cn("cell", display == null && "empty", abn && "abn", className)}
        aria-label={title}
      >
        {display == null ? (
          <>
            <Plus className="size-3.5" />
            tap
          </>
        ) : (
          display
        )}
      </button>
      <Dialog open={o} onOpenChange={setO}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{title}</DialogTitle>
          {children(() => setO(false))}
        </DialogContent>
      </Dialog>
    </>
  );
}

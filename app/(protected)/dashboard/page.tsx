"use client";
import { Button } from "@/components/shadcn/button";

import SectionHeading from "./_components/SectionHeading";
import { Download, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      <SectionHeading
        eyebrow="TUESDAY, 27 MAY 2025"
        title="Good morning, Dr. Mitchell"
        description="Here's what’s happening across your clinic today."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => alert("Your daily summary is being prepared")}
            >
              <Download />
              Export summary
            </Button>
            <Button onClick={() => console.log("Hi bro")}>
              <Plus />
              New appointment
            </Button>
          </>
        }
      />
    </>
  );
}

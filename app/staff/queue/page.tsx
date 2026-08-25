import { QueueBoard } from "@/components/staff/queue-board";

export default function QueuePage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">Queue Board</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <QueueBoard />
      </div>
    </div>
  );
}

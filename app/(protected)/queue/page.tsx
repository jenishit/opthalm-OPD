import { QueueBoard } from "@/app/(protected)/queue/_components/QueueBoard";

export default function QueuePage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 min-h-0">
        <QueueBoard />
      </div>
    </div>
  );
}

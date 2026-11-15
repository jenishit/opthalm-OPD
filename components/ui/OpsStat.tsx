import { Loader2 } from "lucide-react";

export const opsCard =
  "rounded-[11px] border border-line bg-card shadow-sm";

export function OpsStat({
  label,
  value,
  foot,
  icon: Icon,
  bg,
  text,
}: {
  label: string;
  value: string;
  foot: string;
  icon: React.ElementType;
  bg: string;
  text: string;
}) {
  return (
    <div className={`min-w-0 p-[17px_18px_15px] ${opsCard}`}>
      <div className="flex items-center justify-between gap-2.5 text-[11px] text-mute">
        <span>{label}</span>
        <span className={`grid size-[34px] shrink-0 place-items-center rounded-[9px] ${bg} ${text}`}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <div className="my-3 font-sans text-[27px] font-semibold tracking-[-1px] text-ink">{value}</div>
      <div className="text-[10px] text-mute">{foot}</div>
    </div>
  );
}

/** Loading / error / empty row for list panels. */
export function OpsNotice({
  kind,
  text,
  onRetry,
}: {
  kind: "loading" | "error" | "empty";
  text?: string;
  onRetry?: () => void;
}) {
  if (kind === "loading") {
    return (
      <div role="status" className="flex items-center justify-center gap-2 py-12 text-[11px] text-mute">
        <Loader2 size={15} className="animate-spin" /> {text ?? "Loading…"}
      </div>
    );
  }
  if (kind === "error") {
    return (
      <div role="alert" className="flex items-center justify-center gap-3 py-12 text-[11px] text-destructive">
        <span>{text ?? "Couldn't load this data."}</span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="font-semibold underline">
            Retry
          </button>
        )}
      </div>
    );
  }
  return <div className="py-12 text-center text-[11px] text-mute">{text ?? "Nothing here yet."}</div>;
}

export const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

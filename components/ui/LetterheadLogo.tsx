import { cn } from "@/lib/utils";

/**
 * The clinic logo for printed documents. Renders nothing when there is no logo,
 * so letterheads look the same as before for clinics that haven't set one.
 */
export function LetterheadLogo({ logo, className }: { logo?: string | null; className?: string }) {
  if (!logo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- an inlined data URL or the clinic's own link
    <img src={logo} alt="" className={cn("h-14 w-auto max-w-[8rem] shrink-0 object-contain [print-color-adjust:exact]", className)} />
  );
}

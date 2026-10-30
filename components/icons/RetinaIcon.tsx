import type { SVGProps } from "react";

/** No lucide-react equivalent — clinical condition pictogram. */
export function RetinaIcon({ size = 20, ...props }: { size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="14.5" cy="11" r="2" />
      <path d="M7 8c2-1.5 4-1.8 6-1.3M6.5 15c3 1.6 6 1.5 8.5 0" />
    </svg>
  );
}

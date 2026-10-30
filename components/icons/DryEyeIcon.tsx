import type { SVGProps } from "react";

/** No lucide-react equivalent — clinical condition pictogram. */
export function DryEyeIcon({ size = 20, ...props }: { size?: number | string } & SVGProps<SVGSVGElement>) {
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
      <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

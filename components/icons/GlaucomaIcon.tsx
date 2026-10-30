import type { SVGProps } from "react";

/** No lucide-react equivalent — clinical condition pictogram. */
export function GlaucomaIcon({ size = 20, ...props }: { size?: number | string } & SVGProps<SVGSVGElement>) {
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
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <path d="M12 9v6M9.5 12.5L12 15l2.5-2.5" />
    </svg>
  );
}

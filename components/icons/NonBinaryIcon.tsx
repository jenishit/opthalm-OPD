import type { SVGProps } from "react";

/** No lucide-react equivalent — gender symbol. */
export function NonBinaryIcon({ size = 20, ...props }: { size?: number | string } & SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M3.5 7l3.5 2M17 15l3.5 2M3.5 17l3.5-2M17 9l3.5-2" />
    </svg>
  );
}

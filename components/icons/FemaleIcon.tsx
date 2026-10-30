import type { SVGProps } from "react";

/** No lucide-react equivalent — gender symbol. */
export function FemaleIcon({ size = 20, ...props }: { size?: number | string } & SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v8M8.5 18h7" />
    </svg>
  );
}

import Image from "next/image";

interface OpthalmOKLogoProps {
  /** "dark" renders light text for dark surfaces, "light" renders brand navy. */
  variant?: "dark" | "light";
  /** Rendered width in px; height scales proportionally. */
  width?: number;
}

/** OpthalmOK wordmark: ringed-eye mark + name. Color follows the variant. */
export function OpthalmOKLogo({
  variant = "dark",
  width = 40,
}: OpthalmOKLogoProps) {
  const main = variant === "dark" ? "#F3EFE6" : "#0B2545";
  const accent = "#2DD4BF";
  const muted = variant === "dark" ? "#C3CCD2" : "#5F6B73";

  return (
    <div
      className="flex items-center gap-3"
      style={{ width, color: main }}
      aria-label="OpthalmOK"
    >
      <Image
        src={"/OpthalmOK-mark.png"}
        alt="OpthalmOK"
        loading="eager"
        height={width}
        width={width}
      />
      <span
        className="font-brand-serif leading-none tracking-tight"
        style={{ fontSize: width * 0.34 }}
      >
        Opthalm<span style={{ color: accent }}>OK</span>
        <span
          className="block font-brand-sans font-medium"
          style={{
            fontSize: width * 0.115,
            color: muted,
            marginTop: width * 0.045,
          }}
        >
          EYE CARE SUITE
        </span>
      </span>
    </div>
  );
}

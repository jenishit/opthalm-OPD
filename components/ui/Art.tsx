/** Decorative pictograms for dispensable inventory categories — no existing equivalent in the design system. */
export function Art({ cat, hue, size = 72 }: { cat: string; hue: number; size?: number }) {
  const c = `hsl(${hue} 34% 34%)`;
  const s = `hsl(${hue} 32% 90%)`;
  const shapes: Record<string, React.ReactNode> = {
    contact: (
      <>
        <circle cx="32" cy="32" r="20" fill={s} stroke={c} strokeWidth="2.5" />
        <path d="M18 36q14 14 28 0" fill="none" stroke={c} strokeWidth="2" />
        <circle cx="32" cy="30" r="6" fill="none" stroke={c} strokeWidth="1.8" />
      </>
    ),
    frames: (
      <>
        <rect x="5" y="22" width="22" height="18" rx="7" fill={s} stroke={c} strokeWidth="2.5" />
        <rect x="37" y="22" width="22" height="18" rx="7" fill={s} stroke={c} strokeWidth="2.5" />
        <path
          d="M27 29q5-5 10 0M5 28L2 22M59 28l3-6"
          fill="none"
          stroke={c}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={cat}>
      {shapes[cat] ?? shapes.frames}
    </svg>
  );
}

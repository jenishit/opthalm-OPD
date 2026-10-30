import { encodeCode39 } from "@/lib/barcode39";

const NARROW = 2;
const WIDE = 5;
const HEIGHT = 50;

export function Barcode39({ value, className }: { value: string; className?: string }) {
  const bars = encodeCode39(value);
  let x = 0;
  const rects: React.ReactNode[] = [];
  for (const bar of bars) {
    const w = bar.wide ? WIDE : NARROW;
    if (bar.isBar) {
      rects.push(<rect key={x} x={x} y={0} width={w} height={HEIGHT} fill="currentColor" />);
    }
    x += w;
  }

  return (
    <svg viewBox={`0 0 ${x} ${HEIGHT}`} width={x} height={HEIGHT} className={className} role="img" aria-label={`Barcode for ${value}`}>
      {rects}
    </svg>
  );
}

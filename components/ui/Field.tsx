/** Small-label wrapper around a single chart value cell (Sph/Cyl/Axis under Manifest Refraction). */
export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col items-start gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    {children}
  </div>
);

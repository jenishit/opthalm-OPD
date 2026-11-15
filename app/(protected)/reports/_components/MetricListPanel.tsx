export function MetricListPanel({
  title,
  description,
  metrics,
}: {
  title: string;
  description: string;
  metrics: [string, string][];
}) {
  return (
    <div className="rounded-[11px] border border-line bg-card shadow-sm">
      <div className="px-5 pb-[14px] pt-[19px]">
        <h3 className="m-0 font-display text-base font-semibold text-ink">{title}</h3>
        <p className="m-0 mt-[5px] text-[10px] text-mute">{description}</p>
      </div>
      <div className="px-5 pb-[15px]">
        {metrics.map(([label, value]) => (
          <div key={label} className="flex justify-between border-t border-line py-3 text-[10px] text-mute">
            <span>{label}</span>
            <b className="text-[11px] text-ink">{value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

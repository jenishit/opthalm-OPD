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
    <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="px-5 pb-[14px] pt-[19px]">
        <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">{title}</h3>
        <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">{description}</p>
      </div>
      <div className="px-5 pb-[15px]">
        {metrics.map(([label, value]) => (
          <div key={label} className="flex justify-between border-t border-[#efede6] py-3 text-[10px] text-[#858d81]">
            <span>{label}</span>
            <b className="text-[11px] text-[#3f5443]">{value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

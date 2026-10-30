const ROWS = [
  { label: "Frames", amount: "$28,440", pct: 62, color: "#3c7652" },
  { label: "Prescription lenses", amount: "$12,820", pct: 44, color: "#779ba7" },
  { label: "Sunglasses", amount: "$8,640", pct: 32, color: "#bd9652" },
  { label: "Contact lenses", amount: "$4,920", pct: 22, color: "#9484b1" },
];

export function RevenueBreakdown() {
  return (
    <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] pb-4 shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="px-5 pb-[14px] pt-[19px]">
        <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Revenue by category</h3>
        <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Share of optical sales</p>
      </div>
      {ROWS.map((x) => (
        <div key={x.label} className="px-5 pb-[5px] pt-3">
          <div className="mb-[9px] flex items-center justify-between">
            <span className="text-[10px] text-[#7f887c]">{x.label}</span>
            <b className="text-[11px] text-[#23342c]">{x.amount}</b>
          </div>
          <div className="h-1.5 overflow-hidden rounded-[5px] bg-[#eeece4]">
            <span className="block h-full rounded-[5px]" style={{ width: x.pct + "%", backgroundColor: x.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

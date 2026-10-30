export type ChartRow = [string, string, (e: "od" | "os") => React.ReactNode];

/** Shared OD/OS table layout for the dioptre-style clinical rows (Refraction, IOP). */
export function ChartGrid({ rows }: { rows: ChartRow[] }) {
  const eyes: Array<"od" | "os"> = ["od", "os"];
  return (
    <div className="bg-card border border-line rounded-md overflow-hidden">
      <div className="grid grid-cols-[104px_1fr_1fr] sm:grid-cols-[170px_1fr_1fr] border-b border-line">
        <div />
        {eyes.map((e) => (
          <div key={e} className="p-2.5 border-l border-line text-center font-display font-semibold">
            {e === "od" ? "Right eye" : "Left eye"} <span className="mono-label">{e.toUpperCase()}</span>
          </div>
        ))}
      </div>
      {rows.map(([t, s, f]) => (
        <div
          key={t}
          className="grid grid-cols-[104px_1fr_1fr] sm:grid-cols-[170px_1fr_1fr] border-b border-line last:border-b-0 items-stretch"
        >
          <div className="p-3 sm:p-4 bg-app">
            <div className="font-display font-bold text-base sm:text-lg">{t}</div>
            <div className="mono-label mt-0.5">{s}</div>
          </div>
          {eyes.map((e) => (
            <div key={e} className="p-3 border-l border-line flex items-center">
              {f(e)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

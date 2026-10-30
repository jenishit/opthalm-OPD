import { Cell } from "@/components/ui/Cell";
import { PickerFoot } from "@/components/ui/PickerFoot";
import { Chip } from "@/components/ui/ChartUi";

const VA_D = ["6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
const VA_N = ["N36", "N24", "N18", "N12", "N10", "N8", "N6", "N5"];

export type VaValue = { d: string | null; n: string | null };

/** Tap-to-pick corrected distance / near visual acuity — no existing equivalent. */
export const VaCell = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: VaValue;
  onChange: (v: VaValue) => void;
}) => (
  <Cell title={title} display={value.d || value.n ? `${value.d || "—"}  ${value.n || ""}` : null}>
    {(close) => (
      <>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Distance
        </span>
        <div className="flex flex-wrap gap-2 mt-1.5 mb-4">
          {VA_D.map((v) => (
            <Chip key={v} on={value.d === v} onClick={() => onChange({ ...value, d: v })} className="font-mono text-base">
              {v}
            </Chip>
          ))}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Near</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {VA_N.map((v) => (
            <Chip key={v} on={value.n === v} onClick={() => onChange({ ...value, n: v })} className="font-mono text-base">
              {v}
            </Chip>
          ))}
        </div>
        <PickerFoot
          onClear={() => {
            onChange({ d: null, n: null });
            close();
          }}
          onDone={close}
        />
      </>
    )}
  </Cell>
);

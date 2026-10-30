import { Cell } from "@/components/ui/Cell";
import { Gauge } from "@/components/ui/Gauge";
import { PickerFoot } from "@/components/ui/PickerFoot";

/** Tap-to-pick intraocular pressure (opens the Gauge), flags readings above the normal range. */
export const IopCell = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number | null;
  onChange: (v: number) => void;
}) => (
  <Cell
    title={title}
    display={value == null ? null : `${value.toFixed(2)} mmHg`}
    abn={value != null && value > 21}
  >
    {(close) => (
      <>
        <Gauge value={value ?? 15} onChange={onChange} />
        <PickerFoot onClear={() => onChange(15)} onDone={close} />
      </>
    )}
  </Cell>
);

import { Cell } from "@/components/ui/Cell";
import { AxisDial } from "@/components/ui/AxisDial";
import { PickerFoot } from "@/components/ui/PickerFoot";

export const AxisCell = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) => (
  <Cell title={title} display={value == null ? null : `${value}°`}>
    {(close) => (
      <>
        <AxisDial value={value} onChange={onChange} />
        <PickerFoot
          onClear={() => {
            onChange(null);
            close();
          }}
          onDone={close}
        />
      </>
    )}
  </Cell>
);

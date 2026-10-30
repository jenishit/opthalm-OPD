import { fD } from "@/lib/utils";
import { Cell } from "@/components/ui/Cell";
import { DiopterPicker } from "@/components/ui/DiopterPicker";
import { PickerFoot } from "@/components/ui/PickerFoot";

export const DiopterCell = ({
  title,
  value,
  onChange,
  defSign,
  extra,
  className,
}: {
  title: string;
  value: number | null;
  onChange: (v: number | null) => void;
  defSign?: 1 | -1;
  extra?: React.ReactNode;
  className?: string;
}) => (
  <Cell title={title} display={value == null ? null : fD(value)} className={className}>
    {(close) => (
      <>
        <DiopterPicker value={value} onChange={onChange} defSign={defSign} />
        <PickerFoot
          onClear={() => {
            onChange(null);
            close();
          }}
          onDone={close}
          extra={extra}
        />
      </>
    )}
  </Cell>
);

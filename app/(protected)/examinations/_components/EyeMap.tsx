import { Card } from "@/components/shadcn/card";
import { Segmented, Chip } from "@/components/ui/ChartUi";
import { ANAT } from "@/types/eye-types";
import { AnatomyEye } from "./AnatomyEye";

type AnatId = keyof typeof ANAT;

export default function EyeMap({
  eye,
  onEyeChange,
  marks,
  toggleMark,
}: {
  eye: "od" | "os";
  onEyeChange: (eye: "od" | "os") => void;
  marks: string[];
  toggleMark: (id: AnatId) => void;
}) {
  return (
    <Card className="p-4 flex flex-col items-center gap-3">
      <div className="self-start flex flex-wrap items-center gap-3">
        <Segmented
          value={eye}
          onChange={onEyeChange}
          options={[
            { value: "od", label: "Right (OD)" },
            { value: "os", label: "Left (OS)" },
          ]}
        />
        <span className="text-sm text-mute">Tap a structure to mark pathology.</span>
      </div>
      <AnatomyEye marks={marks} toggle={toggleMark} />
      <div className="flex flex-wrap gap-1.5 justify-center">
        {(Object.entries(ANAT) as Array<[AnatId, string]>).map(([k, n]) => (
          <Chip key={k} warm on={marks.includes(k)} onClick={() => toggleMark(k)}>
            {n}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

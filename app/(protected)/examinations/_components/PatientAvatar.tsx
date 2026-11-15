import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { avatarAccent } from "@/lib/utils";
import type { ExamPatient } from "./types";

export function PatientAvatar({ p, size = "default" }: { p: ExamPatient; size?: "sm" | "default" | "lg" }) {
  const { hue, initials } = avatarAccent(p.name);
  return (
    <Avatar size={size}>
      {p.photo && <AvatarImage src={p.photo} alt={p.name} />}
      <AvatarFallback className="font-display font-semibold" style={{ background: `hsl(${hue} 28% 82%)`, color: "var(--c-on-pastel)" }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

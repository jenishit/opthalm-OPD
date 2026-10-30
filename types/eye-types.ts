import type { ComponentType, SVGProps } from "react";
import { Ellipsis, Glasses } from "lucide-react";
import { CataractIcon } from "@/components/icons/CataractIcon";
import { GlaucomaIcon } from "@/components/icons/GlaucomaIcon";
import { RetinaIcon } from "@/components/icons/RetinaIcon";
import { DryEyeIcon } from "@/components/icons/DryEyeIcon";

/** Icon type shared by both lucide-react icons and this app's custom icons — lucide icons are structurally compatible. */
export type EyeIcon = ComponentType<{ size?: number | string } & SVGProps<SVGSVGElement>>;

/** Display labels for OD (right eye) / OS (left eye). */
export const EYE = { od: "Right eye · OD", os: "Left eye · OS" } as const;

/** Condition catalog shared by the new-patient wizard and the examinations workspace. */
export const CONDS: Array<{ id: string; name: string; icon: EyeIcon }> = [
  { id: "cataract", name: "Cataract", icon: CataractIcon },
  { id: "glaucoma", name: "Glaucoma", icon: GlaucomaIcon },
  { id: "retina", name: "Retina", icon: RetinaIcon },
  { id: "dryeye", name: "Dry Eye", icon: DryEyeIcon },
  { id: "refractive", name: "Refractive", icon: Glasses },
  { id: "other", name: "Other", icon: Ellipsis },
];

/** CONDS indexed by id, for quick lookups (patient condition badges, history icons). */
export const COND: Record<string, { id: string; name: string; icon: EyeIcon }> = Object.fromEntries(
  CONDS.map((c) => [c.id, c])
);

export const ANAT = {
    cornea: "Cornea",
    ac: "Anterior chamber",
    iris: "Iris",
    lens: "Lens",
    vitreous: "Vitreous",
    retina: "Retina",
    macula: "Macula",
    nerve: "Optic nerve",
    sclera: "Sclera",
};
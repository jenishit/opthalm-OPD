/** Slit-lamp regions: id -> display name, the "normal" finding, and the tappable option list. */
export const SLIT = {
  lids: { n: "Lids", norm: "Normal", o: ["Normal", "Blepharitis", "Ptosis", "Entropion", "Ectropion"] },
  conj: { n: "Conjunctiva", norm: "Normal", o: ["Normal", "Injection", "Chemosis", "Discharge", "Pterygium"] },
  k: { n: "Cornea (K)", norm: "Clear", o: ["Clear", "Hazy", "Edema", "Scar", "Pterygium", "Infiltrate", "Arcus"] },
  ac: { n: "Anterior chamber", norm: "Deep & quiet", o: ["Deep & quiet", "Shallow", "Cells/flare", "Synechiae"] },
  p: { n: "Pupil", norm: "NSRL", o: ["NSRL", "Sluggish", "Irregular", "Fixed", "APD"] },
  l: { n: "Lens (L)", norm: "Clear", o: ["Clear", "Early NS cataract", "Mature cataract", "PCO", "Aphakic"] },
};

/** Fundus pathology mark types, placed by tapping the retina drawing. */
export const FMARKS: Array<{ id: string; n: string; c: string }> = [
  { id: "hem", n: "Haemorrhage", c: "var(--color-bad)" },
  { id: "exudate", n: "Exudate", c: "var(--color-warn)" },
  { id: "drusen", n: "Drusen", c: "#8477A3" },
  { id: "tear", n: "Tear / hole", c: "var(--color-sage)" },
];

export const FSTATUS = [
  "Normal",
  "Diabetic retinopathy",
  "Hypertensive retinopathy",
  "Glaucomatous cupping",
  "ARMD",
  "Retinal detachment",
] as const;

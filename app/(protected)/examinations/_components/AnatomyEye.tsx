import React from "react";
import { ANAT } from "@/types/eye-types";

type AnatId = keyof typeof ANAT;

/** Clickable eye cross-section diagram — tap a structure to mark pathology. */
export function AnatomyEye({
  marks,
  toggle,
}: {
  marks: string[];
  toggle: (id: AnatId) => void;
}) {
  const m = (r: AnatId) => marks.includes(r);
  const f = (r: AnatId) => (m(r) ? "var(--color-clay-soft)" : "var(--color-sage-soft)");
  const s = (r: AnatId) => (m(r) ? "var(--color-clay)" : "var(--color-mute)");
  const pins: Record<AnatId, [number, number]> = {
    cornea: [150, 170],
    ac: [190, 170],
    iris: [225, 122],
    lens: [246, 170],
    vitreous: [330, 170],
    retina: [366, 94],
    macula: [397, 160],
    nerve: [440, 205],
    sclera: [290, 50],
  };
  const R = (id: AnatId, el: React.ReactElement<React.SVGProps<SVGElement>>) =>
    React.cloneElement(el, {
      className: "cursor-pointer",
      onClick: () => toggle(id),
      fill: el.props.fill || f(id),
      stroke: s(id),
      strokeWidth: m(id) ? 3 : 2,
      children: <title>{ANAT[id]}</title>,
    });
  return (
    <svg viewBox="0 0 520 340" className="w-full max-w-[640px]" role="group" aria-label="Eye anatomy map">
      <circle cx="290" cy="170" r="118" fill="var(--color-card)" stroke="var(--color-strong)" strokeWidth="1" />
      {R("sclera", <circle cx="290" cy="170" r="118" fill="none" style={{ pointerEvents: "stroke" }} />)}
      {R("vitreous", <ellipse cx="320" cy="170" rx="84" ry="98" />)}
      {R("ac", <path d="M200 120 C158 144 158 196 200 220 L216 218 L216 122Z" />)}
      <polygon
        points="214,104 232,104 236,146 216,150"
        className="cursor-pointer"
        fill={f("iris")}
        stroke={s("iris")}
        strokeWidth="2"
        onClick={() => toggle("iris")}
      >
        <title>Iris</title>
      </polygon>
      <polygon
        points="214,236 232,236 236,194 216,190"
        className="cursor-pointer"
        fill={f("iris")}
        stroke={s("iris")}
        strokeWidth="2"
        onClick={() => toggle("iris")}
      >
        <title>Iris</title>
      </polygon>
      {R("lens", <ellipse cx="246" cy="170" rx="16" ry="40" />)}
      {R("cornea", <path d="M192 108 C130 140 130 200 192 232 L200 220 C158 196 158 144 200 120Z" />)}
      <path
        d="M271 64 A108 108 0 1 1 271 276"
        fill="none"
        stroke={s("retina")}
        strokeWidth="9"
        className="cursor-pointer"
        onClick={() => toggle("retina")}
        style={{ pointerEvents: "stroke" }}
      >
        <title>Retina</title>
      </path>
      {R("macula", <circle cx="397" cy="160" r="9" />)}
      {R("nerve", <path d="M400 190 L474 200 L474 224 L404 216Z" />)}
      {(Object.entries(pins) as Array<[AnatId, [number, number]]>).map(
        ([id, [x, y]]) =>
          m(id) && (
            <g key={id} style={{ pointerEvents: "none" }}>
              <circle cx={x} cy={y} r="10" fill="var(--color-clay)" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-onacc)">
                !
              </text>
            </g>
          )
      )}
      {(
        [
          ["Cornea", 60, 172],
          ["Lens", 226, 300],
          ["Iris", 210, 60],
          ["Vitreous", 300, 230],
          ["Retina", 410, 70],
          ["Macula", 410, 140],
          ["Optic nerve", 420, 262],
        ] as Array<[string, number, number]>
      ).map(([t, x, y]) => (
        <text
          key={t}
          x={x}
          y={y}
          fontSize="13"
          fill="var(--color-mute)"
          style={{ pointerEvents: "none" }}
        >
          {t}
        </text>
      ))}
    </svg>
  );
}

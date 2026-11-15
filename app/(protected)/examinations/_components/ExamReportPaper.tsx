import type { SellerInfo } from "@/lib/pos/seller";
import { addDays, fmtDate, today0 } from "@/lib/utils";
import { ANAT, COND } from "@/types/eye-types";
import { SLIT, FMARKS } from "./data";
import { FINDINGS } from "./exam-defaults";
import { snellenVA } from "./Snellen";
import { LetterheadLogo } from "@/components/ui/LetterheadLogo";
import { AnatomyEye } from "./AnatomyEye";
import { FundusDiagram } from "./FundusDiagram";
import { SlitDiagram } from "./SlitDiagram";
import type { ExamPatient, ExamState } from "./types";

const GENDER = { m: "Male", f: "Female", o: "Other" } as const;
const EYES = [
  { k: "od", label: "Right eye (OD)" },
  { k: "os", label: "Left eye (OS)" },
] as const;

const signed = (v: number | null | undefined) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}`);
const cell = "border border-neutral-500 px-2 py-1.5 align-top";
const head = `${cell} bg-neutral-100 text-left text-[10px] font-bold uppercase tracking-wide`;

/** The same drawing for the right and left eye, side by side with the eye labelled. */
function EyePair({ children }: { children: (eye: "od" | "os") => React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-2 gap-4">
      {EYES.map(({ k, label }) => (
        <figure key={k} className="flex flex-col items-center">
          <figcaption className="mb-0.5 text-[10px] font-bold uppercase tracking-wide">{label}</figcaption>
          {children(k)}
        </figure>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 break-inside-avoid">
      <h2 className="mb-1 border-b border-neutral-800 pb-0.5 text-[11px] font-bold uppercase tracking-wider">{title}</h2>
      {children}
    </section>
  );
}

/**
 * The whole examination as a paper record — not just the spectacle
 * prescription. Everything entered on the chart is printed; blank values show
 * as "—" so the printout reads like a completed examination form.
 */
export function ExamReportPaper({
  p,
  ex,
  examiner,
  clinic,
  at,
}: {
  p: ExamPatient;
  ex: ExamState;
  examiner: string;
  clinic: SellerInfo | null;
  at: Date;
}) {
  const complaint = p.chiefComplaint ?? COND[p.visits[0]?.dx ?? ""]?.name ?? "Comprehensive eye examination";
  const findings = [...ex.findings.map((id) => FINDINGS.find((f) => f.id === id)?.n ?? id), ...ex.customFindings];
  const fuDate = ex.fu != null ? fmtDate(addDays(today0(), ex.fu), { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <article aria-label={`Examination record for ${p.name}`} className="paper-light mx-auto w-full max-w-[210mm] bg-white p-6 text-[11px] leading-snug text-black [print-color-adjust:exact] print:max-w-none print:p-0">
      <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-2">
        <div className="flex items-start gap-3">
          <LetterheadLogo logo={clinic?.logo} className="h-12" />
          <div>
            <h1 className="text-base font-bold uppercase">{clinic?.name ?? "Eye clinic"}</h1>
            {clinic?.address && <p>{clinic.address}</p>}
            <p>{[clinic?.phone && `Tel: ${clinic.phone}`, clinic?.email].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-wide">Ophthalmic Examination Record</p>
          <p>Date: {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(at)}</p>
        </div>
      </header>

      <table className="mt-3 w-full border-collapse">
        <tbody>
          <tr>
            <th className={`${head} w-24`}>Patient</th>
            <td className={cell}><b>{p.name}</b></td>
            <th className={`${head} w-24`}>Age / Sex</th>
            <td className={cell}>{p.ageLabel ?? `${p.age} yrs`} / {GENDER[p.g]}</td>
          </tr>
          <tr>
            <th className={head}>Patient ID</th>
            <td className={`${cell} font-mono`}>{p.id}</td>
            <th className={head}>Examiner</th>
            <td className={cell}>{examiner}</td>
          </tr>
          <tr>
            <th className={head}>Complaint</th>
            <td className={cell} colSpan={3}>{complaint}</td>
          </tr>
        </tbody>
      </table>

      <Section title="Visual acuity & refraction">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className={head} rowSpan={2}>Eye</th>
              <th className={head} rowSpan={2}>Unaided VA</th>
              <th className={head} colSpan={2}>Retinoscopy (meridian)</th>
              <th className={head} colSpan={4}>Manifest refraction</th>
              <th className={head} colSpan={2}>Corrected VA</th>
            </tr>
            <tr>
              {["Vert.", "Horiz.", "SPH", "CYL", "AXIS", "ADD", "Dist.", "Near"].map((h) => (
                <th key={h} className={head}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EYES.map(({ k, label }) => {
              const va = snellenVA(ex.va[k]);
              return (
                <tr key={k}>
                  <td className={`${cell} text-left font-bold`}>{label}</td>
                  <td className={cell}>{va ? va.l : "—"}</td>
                  <td className={cell}>{signed(ex.ret[k][0])}</td>
                  <td className={cell}>{signed(ex.ret[k][1])}</td>
                  <td className={cell}>{signed(ex.mr[k].s)}</td>
                  <td className={cell}>{signed(ex.mr[k].c)}</td>
                  <td className={cell}>{ex.mr[k].a != null ? `${ex.mr[k].a}°` : "—"}</td>
                  <td className={cell}>{signed(ex.add[k])}</td>
                  <td className={cell}>{ex.cv[k].d ?? "—"}</td>
                  <td className={cell}>{ex.cv[k].n ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section title="Intraocular pressure">
        <table className="w-full border-collapse text-center">
          <tbody>
            <tr>
              {EYES.map(({ k, label }) => (
                <td key={k} className={cell}><b>{label}:</b> {ex.iop[k] != null ? `${ex.iop[k]} mmHg` : "—"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Slit-lamp examination">
        <EyePair>{(k) => <SlitDiagram eye={k} v={ex.slit[k]} className="w-full max-w-[230px]" />}</EyePair>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={head}>Structure</th>
              <th className={head}>Right eye (OD)</th>
              <th className={head}>Left eye (OS)</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(SLIT) as Array<keyof typeof SLIT>).map((r) => (
              <tr key={r}>
                <td className={`${cell} font-semibold`}>{SLIT[r].n}</td>
                <td className={cell}>{ex.slit.od[r] ?? "—"}</td>
                <td className={cell}>{ex.slit.os[r] ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Fundus">
        <EyePair>{(k) => <FundusDiagram eye={k} d={ex.fundus[k]} className="w-full max-w-[170px]" />}</EyePair>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={head}>&nbsp;</th>
              <th className={head}>Right eye (OD)</th>
              <th className={head}>Left eye (OS)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${cell} font-semibold`}>Cup : disc</td>
              <td className={cell}>{ex.fundus.od.cd.toFixed(1)}</td>
              <td className={cell}>{ex.fundus.os.cd.toFixed(1)}</td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>Status</td>
              <td className={cell}>{ex.fundus.od.status.join(", ") || "—"}</td>
              <td className={cell}>{ex.fundus.os.status.join(", ") || "—"}</td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>Marks</td>
              {EYES.map(({ k }) => {
                const parts = FMARKS.map((m) => ({ n: m.n, c: ex.fundus[k].marks.filter((x) => x.t === m.id).length })).filter((m) => m.c);
                return <td key={k} className={cell}>{parts.length ? parts.map((m) => `${m.c} ${m.n.toLowerCase()}`).join(", ") : "—"}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Eye map — structures marked">
        <EyePair>{(k) => <AnatomyEye marks={ex.marks[k]} toggle={() => {}} />}</EyePair>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              {EYES.map(({ k, label }) => (
                <td key={k} className={cell}>
                  <b>{label}:</b> {ex.marks[k].length ? ex.marks[k].map((id) => ANAT[id as keyof typeof ANAT] ?? id).join(", ") : "none marked"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Section>

      {ex.investigations.length > 0 && (
        <Section title="Investigations">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={head}>Test</th>
                <th className={head}>Eye</th>
                <th className={head}>Result</th>
                <th className={head}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ex.investigations.map((r) => (
                <tr key={r.id}>
                  <td className={cell}>{r.type}</td>
                  <td className={cell}>{r.eye || "—"}</td>
                  <td className={cell}>{r.result || "—"}</td>
                  <td className={cell}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="Findings">
        {findings.length ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {findings.map((f) => (
              <li key={f} className="flex items-start gap-1.5">
                <span aria-hidden className="mt-[1px] inline-block size-3 shrink-0 border border-black text-center text-[9px] leading-[11px]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p>No findings recorded.</p>
        )}
      </Section>

      <Section title="Notes">
        <div className="min-h-[60px] whitespace-pre-wrap border border-neutral-500 p-2">{ex.notes || "—"}</div>
      </Section>

      <Section title="Follow-up">
        <p>
          {fuDate ? `Review around ${fuDate}.` : "No follow-up scheduled."} {ex.fuNote}
        </p>
      </Section>

      <footer className="mt-8 grid grid-cols-2 gap-10 text-center">
        <div>
          <div className="mb-1 h-px bg-black" />
          Examiner: {examiner}
        </div>
        <div>
          <div className="mb-1 h-px bg-black" />
          Date &amp; signature
        </div>
      </footer>
    </article>
  );
}

import { OpthalmOKLogo } from "./OpthalmOKLogo";

/**
 * Split-screen chrome for the auth group: brand panel on the left, form
 * panel on the right. Pages drop their form into `children`.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen font-brand-sans lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-hero px-6 py-8 text-hero-ink lg:min-h-screen lg:px-[4.5rem] lg:py-16">
        <svg
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="pointer-events-none absolute -bottom-56 -right-60 hidden h-[720px] w-[720px] text-hero-accent opacity-[0.16] lg:block"
        >
          <g fill="none" stroke="currentColor">
            <circle cx="300" cy="300" r="290" strokeWidth="1" />
            <circle cx="300" cy="300" r="230" strokeWidth="1" />
            <circle
              cx="300"
              cy="300"
              r="170"
              strokeWidth="14"
              strokeDasharray="1.5 7"
            />
            <circle cx="300" cy="300" r="110" strokeWidth="1" />
            <circle cx="300" cy="300" r="52" strokeWidth="2" />
          </g>
        </svg>

        <div className="relative">
          <OpthalmOKLogo variant="dark" width={76} />
        </div>

        <div className="relative hidden max-w-[30rem] lg:block">
          <h1 className="font-brand-serif text-[3.6rem] font-normal leading-[1.05]">
            Clear sight for <em className="text-hero-accent">every</em> clinic.
          </h1>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-hero-mute">
            Patient records, imaging and appointments, together in one calm,
            secure workspace.
          </p>
        </div>

        <p className="relative hidden text-[0.8rem] text-hero-mute lg:block">
          &copy; {new Date().getFullYear()} OpthalmOK
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-app px-6 py-10 lg:px-12 lg:py-16">
        {children}
      </section>
    </main>
  );
}

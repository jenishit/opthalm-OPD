import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ServiceWorkerRegister } from "@/providers/ServiceWorkerRegister";
import { AppearanceProvider } from "@/providers/AppearanceProvider";
import { Toaster } from "@/components/shadcn/sonner";
import "./globals.css";

// Self-hosted (app/fonts) — no runtime or build-time dependency on Google Fonts.
const sourceSans = localFont({
  variable: "--font-source-sans",
  src: [{ path: "./fonts/source-sans-3-latin-wght-normal.woff2", weight: "200 900", style: "normal" }],
  display: "swap",
});

const lora = localFont({
  variable: "--font-lora",
  src: [
    { path: "./fonts/lora-latin-wght-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/lora-latin-wght-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
});

const inconsolata = localFont({
  variable: "--font-inconsolata",
  src: [{ path: "./fonts/inconsolata-latin-wght-normal.woff2", weight: "200 900", style: "normal" }],
  display: "swap",
});

/** Brand display serif (Instrument Serif) — login/auth surfaces. */
const instrumentSerif = localFont({
  variable: "--font-instrument",
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
});

/** Brand sans (Poppins) — login/auth surfaces. */
const poppins = localFont({
  variable: "--font-poppins",
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

/** Devanagari glyph coverage (BS dates, Nepali month names) — fallback only. */
const notoDevanagari = localFont({
  variable: "--font-noto-dev",
  src: [{ path: "./fonts/noto-sans-devanagari-devanagari-wght-normal.woff2", weight: "100 900", style: "normal" }],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eye Clinic OPD",
  description: "Eye Clinic Outpatient Department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${sourceSans.variable} ${lora.variable} ${inconsolata.variable} ${instrumentSerif.variable} ${poppins.variable} ${notoDevanagari.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Base path follows the catch-all route location — see
                app/api/nextauth/[...nextauth]/route.ts. */}
            <SessionProvider basePath="/api/nextauth" refetchOnWindowFocus={false} refetchInterval={0}>
              <AuthProvider>
                <AppearanceProvider>{children}</AppearanceProvider>
              </AuthProvider>
              <Toaster />
              <ServiceWorkerRegister />
            </SessionProvider>
          </ThemeProvider>
        </body>
      </html>
    );
}

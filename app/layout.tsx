import type { Metadata } from "next";
import { Inconsolata, Instrument_Serif, Lora, Noto_Sans_Devanagari, Poppins, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/shadcn/sonner";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: "variable",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
});

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
  weight: "variable",
});

/** Brand display serif (Instrument Serif) — login/auth surfaces. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

/** Brand sans (Poppins) — login/auth surfaces. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Devanagari glyph coverage (BS dates, Nepali month names) — fallback only. */
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-dev",
  subsets: ["devanagari"],
  weight: "variable",
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
              <AuthProvider>{children}</AuthProvider>
              <Toaster />
            </SessionProvider>
          </ThemeProvider>
        </body>
      </html>
    );
}

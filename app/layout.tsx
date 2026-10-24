import type { Metadata } from "next";
import { Inconsolata, Lora, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
        className={`${sourceSans.variable} ${lora.variable} ${inconsolata.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    );
}

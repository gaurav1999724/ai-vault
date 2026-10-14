import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";
import { ToastProvider } from "@/components/site/toast-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "AI Creative Vault",
    template: "%s · AI Creative Vault",
  },
  description: "Explore the prompts, tools, and creative workflows behind extraordinary AI-generated visuals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrument.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-ink">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[120] focus:bg-ink focus:px-3 focus:py-2 focus:text-background">
          Skip to content
        </a>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

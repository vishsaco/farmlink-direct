import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/LanguageContext";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const caveatFont = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FarmLink Direct — Direct B2B Fresh Produce Platform",
  description:
    "A direct B2B fresh produce marketplace connecting verified farmers and FPOs with reliable institutional buyers, transparent price intelligence, and traceable fulfillment across the whole of Lucknow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${caveatFont.variable}`}>
      <body className="bg-[#FAFAF9] text-slate-800 font-sans min-h-screen antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

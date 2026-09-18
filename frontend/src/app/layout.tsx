import type { Metadata } from "next";
import { Manrope, Inter, Caveat } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/LanguageContext";

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const sansFont = Inter({
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
  title: "FarmLink Direct — From Farm Gate to Market",
  description:
    "Connect verified farmers and FPOs directly with commercial buyers through transparent pricing, smarter harvest planning and traceable fulfillment across Lucknow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${sansFont.variable} ${caveatFont.variable}`}>
      <body className="bg-[#F6F5F1] text-[#262238] font-sans min-h-screen antialiased selection:bg-[#E8E4F2] selection:text-[#262238]">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

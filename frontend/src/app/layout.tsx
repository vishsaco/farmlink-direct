import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, Caveat } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/LanguageContext";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const caveatFont = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FarmLink — Direct B2B Produce Network & Weather Intelligence",
  description:
    "A direct B2B fresh produce marketplace connecting verified farmers and FPOs with reliable institutional buyers, transparent price intelligence, and traceable fulfillment across Lucknow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} ${caveatFont.variable}`}>
      <body className="bg-[#F7F5EF] text-[#17201D] font-sans min-h-screen antialiased selection:bg-[#DCE8DD] selection:text-[#173D32]">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import "nes.css/css/nes.min.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

import { InsertCoin } from "@/components/InsertCoin";
import { DonateButton } from "@/components/DonateButton";

export const metadata: Metadata = {
  title: "LC-Games C64 Archive",
  description: "Commodore 64 Retro Game Archive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} min-h-screen`}
      >
        <InsertCoin />
        <div className="crt-scanline" />
        <main className="min-h-screen p-4">
            {children}
        </main>
        <footer className="p-8 text-center opacity-80">
            <p className="text-xs mb-4 text-c64-text">LC-GAMES ARCHIVE</p>
            <DonateButton />
        </footer>
      </body>
    </html>
  );
}

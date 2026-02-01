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
import { Providers } from "./providers";
import LoginButton from "@/components/LoginButton";

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
        <Providers>
            <InsertCoin />
            <div className="crt-scanline" />
            <header className="flex justify-end p-4 absolute top-0 right-0 z-20">
                <LoginButton />
            </header>
            <main className="min-h-screen p-4 pt-16">
                {children}
            </main>
            <footer className="p-8 text-center opacity-80">
                <p className="text-xs mb-4 text-c64-text">LC-GAMES ARCHIVE</p>
                <DonateButton />
            </footer>
        </Providers>
      </body>
    </html>
  );
}

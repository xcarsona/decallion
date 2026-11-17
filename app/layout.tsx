import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { SiteNav } from "@/components/ui/SiteNav";
import "./globals.css";

// VT323 (SIL Open Font License), self-hosted so the build needs no network access.
const pixel = localFont({ src: "./fonts/VT323.woff2", weight: "400", variable: "--font-vt323", display: "swap" });

export const metadata: Metadata = {
  title: "Decallion",
  description: "Rare-answer business trivia for DECA competitors. The answer nobody else gives climbs highest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={pixel.variable}>
      <body>
        <div className="wrap">
          <header>
            <h1>Deca<span>llion</span></h1>
            <Suspense fallback={null}>
              <SiteNav />
            </Suspense>
          </header>
          {children}
          <footer>Unofficial practice game. Not affiliated with or endorsed by DECA Inc. Answer levels are editorial estimates, not live player data.</footer>
        </div>
      </body>
    </html>
  );
}

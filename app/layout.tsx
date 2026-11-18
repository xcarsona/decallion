import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// VT323 (SIL Open Font License), self-hosted so the build needs no network access.
const pixel = localFont({ src: "./fonts/VT323.woff2", weight: "400", variable: "--font-vt323", display: "swap" });

export const metadata: Metadata = {
  title: "Decallion",
  description: "Rare-answer business trivia for DECA competitors. The answer nobody else gives climbs highest.",
};

/* The page frame comes from the route group: app/(game) fills the viewport, app/(site) is a scrolling page. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={pixel.variable}>
      <body>{children}</body>
    </html>
  );
}

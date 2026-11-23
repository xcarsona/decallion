import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DESCRIPTION, SITE_NAME, SITE_URL, THEME_COLOR } from "./site-info";
import "./globals.css";

// VT323 (SIL Open Font License), self-hosted so the build needs no network access.
const pixel = localFont({ src: "./fonts/VT323.woff2", weight: "400", variable: "--font-vt323", display: "swap" });

/* Pages give a short title ("Training log") and the template adds the site name. The share image comes from
   app/opengraph-image.tsx and the icons from app/favicon.ico, app/icon.svg and app/apple-icon.png.
   The home page's canonical address is set in app/(game)/layout.tsx; other pages set their own (see site-info.ts). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { title: SITE_NAME, description: DESCRIPTION, siteName: SITE_NAME, type: "website", url: "/" },
  twitter: { card: "summary_large_image" },
};

// The browser's own bars take the page's navy. Nested layouts add fields to this; they do not replace it.
export const viewport: Viewport = { themeColor: THEME_COLOR, colorScheme: "dark" };

/* The page frame comes from the route group: app/(game) fills the viewport, app/(site) is a scrolling page. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={pixel.variable}>
      <body>
        {/* without JavaScript the game never leaves its loading screen, so this sits above that screen */}
        <noscript>
          <p className="noscript">Decallion needs JavaScript. Turn it on and reload.</p>
        </noscript>
        {children}
      </body>
    </html>
  );
}

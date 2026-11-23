import type { Metadata } from "next";

/* Facts about the site that several files under app/ repeat: the address, the name, the one-line description and
   the contact address. Nothing here is secret: NEXT_PUBLIC_ values are built into the pages. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://decallion.vercel.app";
export const SITE_NAME = "Decallion";
export const DESCRIPTION = "Unofficial rare-answer business trivia for DECA competitors. The answer nobody else gives climbs highest.";
export const THEME_COLOR = "#07142e";
/** Where to send a request to take a leaderboard name down. Empty when the site owner has not set one. */
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();

/** The share image drawn by app/opengraph-image.tsx. */
const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Decallion. The answer nobody else gives climbs highest." };

/** Metadata for a page other than the home page. `title` goes through the root layout's "%s · Decallion" template.
    A page that sets openGraph replaces the root layout's whole openGraph object, share image included, so every
    field is repeated here. */
export function pageMetadata(title: string, path: string): Metadata {
  return {
    title,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${SITE_NAME}`, description: DESCRIPTION, siteName: SITE_NAME, type: "website", url: path, images: [SHARE_IMAGE] },
  };
}

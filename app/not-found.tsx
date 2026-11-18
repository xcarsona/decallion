import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";

export const metadata: Metadata = { title: "Page not found · Decallion" };

/* Sits outside the route groups, so it brings its own page frame. */
export default function NotFound() {
  return (
    <div className="wrap">
      <SiteHeader />
      <section className="card">
        <h2>Page not found</h2>
        <p>There is nothing at this address. <Link href="/">Back to the game</Link></p>
      </section>
      <SiteFooter className="sitefoot" />
    </div>
  );
}

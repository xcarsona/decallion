import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";

// absolute: the tab reads the same whether or not the root layout's title template reaches this file
export const metadata: Metadata = { title: { absolute: "Page not found · Decallion" } };

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

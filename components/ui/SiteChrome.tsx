import Link from "next/link";
import { Suspense } from "react";
import { SiteNav } from "./SiteNav";

/** The logo and the site links. Shared by the full-height game layout and the scrolling page layout. */
export function SiteHeader() {
  return (
    <header className="sitehead">
      <h1>Deca<span>llion</span></h1>
      <Suspense fallback={null}>
        <SiteNav />
      </Suspense>
    </header>
  );
}

/** The disclaimer shown on every page, and the link to the privacy page. */
export function SiteFooter({ className }: { className: string }) {
  return (
    <footer className={className}>
      Unofficial practice game. Not affiliated with or endorsed by DECA Inc. Answer levels are editorial estimates, not live player data.{" "}
      <Link href="/privacy" id="privacyLink">Privacy</Link>
    </footer>
  );
}

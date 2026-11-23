"use client"; // error boundaries must be Client Components
import { useEffect } from "react";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { ResetSavedData } from "./reset-saved-data";

/* Shown in place of a page that crashed. Like app/not-found.tsx it sits outside the route groups, so it brings its
   own page frame. `retry` fetches the page again and redraws it. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="wrap">
      <SiteHeader />
      <section className="card" id="errorPage" role="alert">
        <h2>Something went wrong</h2>
        <p>This page hit an error. Your saved rounds have not been touched.</p>
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <button type="button" id="errorRetry" onClick={() => retry()}>Try again</button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a plain link, so going home loads the page afresh */}
          <a href="/">Back to the game</a>
        </div>
        <p className="mute">If it keeps happening, the data saved in this browser may be damaged. Resetting it erases your stats, training log and study list on this device.</p>
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <ResetSavedData className="ghost mini" />
        </div>
      </section>
      <SiteFooter className="sitefoot" />
    </div>
  );
}

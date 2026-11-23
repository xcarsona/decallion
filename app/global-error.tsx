"use client"; // error boundaries must be Client Components
import { useEffect } from "react";
import { ResetSavedData } from "./reset-saved-data";

/* Shown when the root layout itself fails. It replaces that layout, so it draws its own <html> and <body> and uses
   nothing else from the site: no shared components, no stylesheet, no web font. The colours are the ones in
   app/globals.css, written out. */
const NAVY = "#07142e";
const INK = "#eef3fb";
const GLASS = "#7fe3f2";
const MUTE = "#8fa5c9";
const LINE = "rgba(143,165,201,.35)";
const FONT = "'VT323','Courier New',ui-monospace,monospace";
const button: React.CSSProperties = { font: "inherit", fontSize: 20, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0, border: `3px solid ${GLASS}`, background: GLASS, color: "#052046", padding: "10px 18px" };
const small: React.CSSProperties = { ...button, fontSize: 16, padding: "3px 10px", borderWidth: 2, background: "#0b1d44", color: INK };

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, background: NAVY, color: INK, fontFamily: FONT, fontSize: 20, lineHeight: 1.2, colorScheme: "dark" }}>
        <title>Something went wrong · Decallion</title>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          <header>
            <h1 style={{ fontSize: 40, lineHeight: 1, margin: 0, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 400 }}>Deca<span style={{ color: GLASS }}>llion</span></h1>
          </header>
          <section id="errorPage" role="alert" style={{ background: "#0f2552", border: `2px solid ${LINE}`, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: 30, lineHeight: 1.05, margin: 0, fontWeight: 400 }}>Something went wrong</h2>
            <p style={{ margin: 0 }}>The site hit an error. Your saved rounds have not been touched.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" id="errorRetry" style={button} onClick={() => retry()}>Try again</button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router may be what failed, so this is a plain link that loads the page afresh */}
              <a href="/" style={{ color: GLASS }}>Back to the game</a>
            </div>
            <p style={{ margin: 0, color: MUTE }}>If it keeps happening, the data saved in this browser may be damaged. Resetting it erases your stats, training log and study list on this device.</p>
            <div>
              <ResetSavedData style={small} />
            </div>
          </section>
          <footer style={{ color: MUTE, fontSize: 17, borderTop: `2px dashed ${LINE}`, paddingTop: 10 }}>
            Unofficial practice game. Not affiliated with or endorsed by DECA Inc. Answer levels are editorial estimates, not live player data.
          </footer>
        </div>
      </body>
    </html>
  );
}

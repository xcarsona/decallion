import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* The picture shown when a link to the site is shared. Drawn from code at build time: original pixel blocks and
   type only, no photos and no DECA artwork. ImageResponse reads ttf, otf and woff but not woff2, so this uses
   app/fonts/VT323.ttf, the same font as app/fonts/VT323.woff2 unpacked (same licence, VT323-LICENSE.txt). */
export const alt = "Decallion. The answer nobody else gives climbs highest.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = await readFile(join(process.cwd(), "app/fonts/VT323.ttf"));

const NAVY = "#07142e";
const INK = "#eef3fb";
const GLASS = "#7fe3f2";
const MUTE = "#8fa5c9";
/** The six answer levels, lowest to highest: the same colours as --t1 to --t6 in app/globals.css. */
const LEVEL_COLORS = ["#c2ab8e", "#b9a0ff", "#ff8ad1", "#ff9a4a", "#ffffff", "#7fe3f2"];
const STEP = 22;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: NAVY, padding: 24, fontFamily: "VT323", color: INK }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `6px solid ${GLASS}` }}>
          <div style={{ display: "flex", fontSize: 230, lineHeight: 1, letterSpacing: 26, paddingLeft: 26 }}>
            <span>DECA</span>
            <span style={{ color: GLASS }}>LLION</span>
          </div>
          <div style={{ display: "flex", fontSize: 46, letterSpacing: 3, marginTop: 6 }}>The answer nobody else gives climbs highest.</div>
          {/* six blocks climbing like steps, one per answer level */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 34, height: 60 + STEP * 5 }}>
            {LEVEL_COLORS.map((color, i) => (
              <div key={color} style={{ width: 96, height: 60 + STEP * i, background: color, borderBottom: "8px solid rgba(0,0,0,0.45)" }} />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 27, letterSpacing: 1, color: MUTE, marginTop: 30 }}>Unofficial practice game. Not affiliated with or endorsed by DECA Inc.</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "VT323", data: font, style: "normal", weight: 400 }] },
  );
}

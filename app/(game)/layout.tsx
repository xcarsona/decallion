import type { Viewport } from "next";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";

// The game fills the viewport: draw under notches (the CSS pads by the safe-area insets) and let the on-screen
// keyboard shrink the layout so the answer bar stays in view.
export const viewport: Viewport = { viewportFit: "cover", interactiveWidget: "resizes-content" };

/* Full-height game layout: a slim top bar, the game screen filling the rest, the disclaimer as one small line. */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <SiteHeader />
      {children}
      <SiteFooter className="fine" />
    </div>
  );
}

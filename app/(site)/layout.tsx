import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";

/* Scrolling page layout for the training log and the leaderboard. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap">
      <SiteHeader />
      {children}
      <SiteFooter className="sitefoot" />
    </div>
  );
}

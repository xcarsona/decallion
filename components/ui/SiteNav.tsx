"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [["/", "Play"], ["/leaderboard", "Leaderboard"]] as const;

export function SiteNav() {
  const path = usePathname();
  return (
    <nav aria-label="Site">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}

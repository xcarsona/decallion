import type { MetadataRoute } from "next";
import { SITE_URL } from "./site-info";

const PATHS = ["/", "/log", "/study", "/leaderboard", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, changeFrequency: path === "/" || path === "/leaderboard" ? "daily" : "monthly", priority: path === "/" ? 1 : 0.5 }));
}

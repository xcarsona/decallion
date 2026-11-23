import type { MetadataRoute } from "next";
import { DESCRIPTION, SITE_NAME, THEME_COLOR } from "./site-info";

/* Lets a phone add the game to its home screen. The icons are the original pixel art in app/icon.svg and the
   180px copy of it in app/apple-icon.png. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
    ],
  };
}

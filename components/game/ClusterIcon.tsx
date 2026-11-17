"use client";
import { useEffect, useRef } from "react";
import { CLUSTERS, CLUSTER_IDS, clusterInfo } from "@/lib/questions";
import type { ClusterInfo } from "@/lib/questions";
import type { ClusterChoice } from "@/types";

/* Original 12x12 pixel icons, one per career cluster plus the All clusters mix, in the style of LevelIcon.
   '#' is the cluster colour, 'o' the highlight, 'x' a dark inset, 'd' a deep shade of the cluster colour. In the "all" icon the digits 1-5 are the five
   cluster colours, one square each. */
const ICONS: Record<ClusterInfo["icon"], string[]> = {
  briefcase: [
    "....####....",
    "...##..##...",
    "...#....#...",
    "############",
    "############",
    "############",
    "xxxxxooxxxxx",
    "#####oo#####",
    "############",
    "############",
    "############",
    "............",
  ],
  lightbulb: [
    "....####....",
    "...######...",
    "..##oo####..",
    "..#oo#####..",
    "..#o######..",
    "..########..",
    "...######...",
    "....####....",
    "....oooo....",
    "....####....",
    "....oooo....",
    ".....##.....",
  ],
  dollar: [
    ".....##.....",
    "...######...",
    "..########..",
    "..##.##.....",
    "..##.##.....",
    "...######...",
    "....######..",
    ".....##.##..",
    ".....##.##..",
    "..########..",
    "...######...",
    ".....##.....",
  ],
  globe: [
    "....#d#.....",
    "..#d#d#d#...",
    ".##d#d#d##..",
    ".#d##d##d#..",
    "##d##d##d##.",
    "ddddddddddd.",
    "##d##d##d##.",
    ".#d##d##d#..",
    ".##d#d#d##..",
    "..#d#d#d#...",
    "....#d#.....",
    "............",
  ],
  phone: [
    "...######...",
    "..########..",
    "..#xxxxxx#..",
    "..#xxoxxx#..",
    "..#xoxxxx#..",
    "..#xxxxxx#..",
    "..#xxxxxx#..",
    "..#xxxxxx#..",
    "..#xxxxxx#..",
    "..########..",
    "..###oo###..",
    "...######...",
  ],
  all: [
    "1111....2222",
    "1111....2222",
    "1111....2222",
    "1111....2222",
    "....3333....",
    "....3333....",
    "....3333....",
    "....3333....",
    "4444....5555",
    "4444....5555",
    "4444....5555",
    "4444....5555",
  ],
};
const DARK = "#0b1d44";
/** The cluster colour mixed part of the way to the dark inset, for lines drawn on top of it. */
function shade(hex: string): string {
  const mix = (i: number) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.6 + parseInt(DARK.slice(i, i + 2), 16) * 0.4);
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`;
}

/** Sized by CSS (see canvas.clicon) unless `size` is given, in CSS pixels. */
export function ClusterIcon({ cluster, size, highlight = "#fff" }: { cluster: ClusterChoice; size?: number; highlight?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    const info = clusterInfo(cluster);
    c.clearRect(0, 0, 12, 12);
    ICONS[info.icon].forEach((row, y) => {
      for (let x = 0; x < 12; x++) {
        const ch = row[x];
        if (ch === ".") continue;
        c.fillStyle = ch === "#" ? info.color : ch === "o" ? highlight : ch === "x" ? DARK : ch === "d" ? shade(info.color) : CLUSTERS[CLUSTER_IDS[Number(ch) - 1]].color;
        c.fillRect(x, y, 1, 1);
      }
    });
  }, [cluster, highlight]);
  return <canvas ref={ref} className="clicon" width={12} height={12} aria-hidden="true" style={size ? { width: size, height: size } : undefined} />;
}

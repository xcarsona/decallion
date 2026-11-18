"use client";
import dynamic from "next/dynamic";

/* The log lives in browser storage, so the page renders in the browser only (same approach as GameLoader). */
const LogPage = dynamic(() => import("./LogPage"), {
  ssr: false,
  loading: () => <section className="card" aria-busy="true"><h2>Training log</h2><p className="mute">Loading your log</p></section>,
});

export default function LogLoader() {
  return <LogPage />;
}

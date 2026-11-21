"use client";
import dynamic from "next/dynamic";

/* The study list lives in browser storage, so the page renders in the browser only (same approach as LogLoader). */
const StudyPage = dynamic(() => import("./StudyPage"), {
  ssr: false,
  loading: () => <section className="card" aria-busy="true"><h2>Study list</h2><p className="mute">Loading your study list</p></section>,
});

export default function StudyLoader() {
  return <StudyPage />;
}

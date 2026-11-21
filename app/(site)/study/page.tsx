import type { Metadata } from "next";
import StudyLoader from "@/components/study/StudyLoader";

export const metadata: Metadata = { title: "Study list · Decallion" };

export default function StudyRoute() {
  return <StudyLoader />;
}

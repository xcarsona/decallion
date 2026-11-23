import type { Metadata } from "next";
import { pageMetadata } from "@/app/site-info";
import StudyLoader from "@/components/study/StudyLoader";

export const metadata: Metadata = pageMetadata("Study list", "/study");

export default function StudyRoute() {
  return <StudyLoader />;
}

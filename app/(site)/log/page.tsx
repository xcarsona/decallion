import type { Metadata } from "next";
import { pageMetadata } from "@/app/site-info";
import LogLoader from "@/components/log/LogLoader";

export const metadata: Metadata = pageMetadata("Training log", "/log");

export default function LogRoute() {
  return <LogLoader />;
}

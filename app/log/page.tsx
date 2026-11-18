import type { Metadata } from "next";
import LogLoader from "@/components/log/LogLoader";

export const metadata: Metadata = { title: "Training log · Decallion" };

export default function LogRoute() {
  return <LogLoader />;
}

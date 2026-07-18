import type { Metadata } from "next";
import { ApplicationsPage } from "@/components/applications/ApplicationsPage";

export const metadata: Metadata = { title: "Job Tracking" };

export default function Page() {
  return <ApplicationsPage />;
}

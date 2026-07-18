import type { Metadata } from "next";
import { JobSearchPage } from "@/components/search/JobSearchPage";

export const metadata: Metadata = { title: "Job Search" };

export default function Page() {
  return <JobSearchPage />;
}

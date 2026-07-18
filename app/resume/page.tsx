import type { Metadata } from "next";
import { ResumeStudioPage } from "@/components/resume/ResumeStudioPage";

export const metadata: Metadata = { title: "Resume Studio" };

export default function Page() {
  return <ResumeStudioPage />;
}

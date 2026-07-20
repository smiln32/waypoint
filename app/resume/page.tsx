import type { Metadata } from "next";
import { ResumeStudioPage } from "@/components/resume/ResumeStudioPage";
import { liveAiEnabled } from "@/lib/live-config";

export const metadata: Metadata = { title: "Resume Studio" };

export default function Page() {
  return <ResumeStudioPage liveAiEnabled={liveAiEnabled()} />;
}

import type { Metadata } from "next";
import { InterviewPage } from "@/components/interview/InterviewPage";
import { liveAiEnabled } from "@/lib/live-config";

export const metadata: Metadata = { title: "Interview Prep" };

export default function Page() {
  return <InterviewPage liveAiEnabled={liveAiEnabled()} />;
}

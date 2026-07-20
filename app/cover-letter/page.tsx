import type { Metadata } from "next";
import { CoverLetterPage } from "@/components/cover-letter/CoverLetterPage";
import { loadCoverLetterExample } from "@/lib/cover-letter-example.server";
import { liveAiEnabled } from "@/lib/live-config";

export const metadata: Metadata = { title: "Cover Letter" };

export default function Page() {
  return <CoverLetterPage example={loadCoverLetterExample()} liveAiEnabled={liveAiEnabled()} />;
}

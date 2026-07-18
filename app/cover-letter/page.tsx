import { CoverLetterPage } from "@/components/cover-letter/CoverLetterPage";
import { loadCoverLetterExample } from "@/lib/cover-letter-example.server";

export default function Page() {
  return <CoverLetterPage example={loadCoverLetterExample()} />;
}

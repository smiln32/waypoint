import { CoverLetterPage } from "@/components/cover-letter/CoverLetterPage";
import { loadCoverLetterTemplates } from "@/lib/cover-letter-templates.server";

export default function Page() {
  return <CoverLetterPage templates={loadCoverLetterTemplates()} />;
}

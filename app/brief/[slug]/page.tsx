import type { Metadata } from "next";
import { BriefView } from "@/components/brief/BriefView";

export const metadata: Metadata = { title: "Company Brief" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BriefView slug={slug} />;
}

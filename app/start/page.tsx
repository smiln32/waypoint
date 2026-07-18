import type { Metadata } from "next";
import { StartHerePage } from "@/components/start/StartHerePage";

export const metadata: Metadata = { title: "Start Here" };

export default function Page() {
  return <StartHerePage />;
}

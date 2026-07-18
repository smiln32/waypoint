import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

// Same-segment pages don't inherit the layout's title template — suffix by hand.
export const metadata: Metadata = { title: "Dashboard · Waypoint" };

export default function Page() {
  return <DashboardPage />;
}

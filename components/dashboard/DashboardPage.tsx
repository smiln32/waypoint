"use client";
import { Heading } from "@/components/ui/Heading";
import type { View } from "@/lib/types";
import { DestinationList } from "./DestinationList";
import { OverviewSection } from "./OverviewSection";
import { StatusStrip } from "./StatusStrip";

export function DashboardPage({ onGo }: { onGo: (view: View) => void }) {
  return (
    <div className="page dashboard-page">
      <section className="dashboard-intro overview-page">
        <Heading
          kicker="FRIDAY, JULY 17"
          title={'"Improvise, adapt, and overcome."'}
          text="One decision at a time. Every recommendation shows its work."
        />
        <section className="workspace-guide">
          <div className="workspace-guide-intro">
            <p>
              Each workspace handles one part of your career transition. You do not have to finish everything
              today—start with the next decision and build from there.
            </p>
          </div>
        </section>
        <h2 className="dashboard-next-title">What&apos;s Next</h2>
      </section>
      <StatusStrip onGo={onGo} />
      <DestinationList onGo={onGo} />
      <OverviewSection onGo={onGo} />
    </div>
  );
}

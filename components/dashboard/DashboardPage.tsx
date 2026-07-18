"use client";
import { Heading } from "@/components/ui/Heading";
import { DestinationList } from "./DestinationList";
import { OverviewSection } from "./OverviewSection";
import { StatusStrip } from "./StatusStrip";

export function DashboardPage() {
  return (
    <div className="page dashboard-page">
      <section className="dashboard-intro overview-page">
        <Heading
          kicker="FRIDAY, JULY 17"
          title={'"Improvise, adapt, and overcome."'}
          text="Simple, actionable guidance to help you navigate your next professional chapter."
        />
        <section className="workspace-guide">
          <div className="workspace-guide-intro">
            <p>
              Each workspace handles one part of your career transition. You do not have to finish everything
              today—start with the next decision and build from there.
            </p>
          </div>
        </section>
        <section className="workspace-guide" aria-label="Career transition workspaces">
          <dl>
            <div>
              <dt>Resume Studio</dt>
              <dd>Translate your experience, review specific editor findings, and approve every change.</dd>
            </div>
            <div>
              <dt>Job Search</dt>
              <dd>See where your verified skills align and which qualified gaps need attention.</dd>
            </div>
            <div>
              <dt>Job Tracking</dt>
              <dd>Keep roles, tailored materials, contacts, deadlines, and follow-ups together.</dd>
            </div>
            <div>
              <dt>Cover Letter</dt>
              <dd>Connect your verified experience to one specific employer and role.</dd>
            </div>
            <div>
              <dt>Interview Practice</dt>
              <dd>Practice realistic questions and learn how to make your experience clear to employers.</dd>
            </div>
          </dl>
        </section>
        <h2 className="dashboard-next-title">What&apos;s Next</h2>
      </section>
      <StatusStrip />
      <DestinationList />
      <OverviewSection />
    </div>
  );
}

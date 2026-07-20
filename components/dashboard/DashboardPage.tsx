"use client";
import { DueCalendar } from "./DueCalendar";
import { MaterialsRow } from "./MaterialsRow";
import { NextSteps } from "./NextSteps";
import { PipelineGlance } from "./PipelineGlance";

export function DashboardPage() {
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <div className="page dashboard-page">
      <div className="heading">
        <small suppressHydrationWarning>{today}</small>
        <h1>Your Military-to-Civilian Transition Workspace</h1>
        <p>
          This workspace supports your civilian job-search process while keeping you responsible for
          every fact, claim, and revision.
        </p>
      </div>
      <NextSteps />
      <PipelineGlance />
      <MaterialsRow />
      <DueCalendar />
    </div>
  );
}

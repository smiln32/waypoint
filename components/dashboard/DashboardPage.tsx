"use client";
import { DemoBanner } from "@/components/layout/DemoMode";
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
      <DemoBanner />
      <div className="heading">
        <small suppressHydrationWarning>{today}</small>
        <h1>Welcome back, James.</h1>
        <p>Simple, actionable guidance to help you navigate your next professional chapter.</p>
      </div>
      <NextSteps />
      <PipelineGlance />
      <MaterialsRow />
      <DueCalendar />
    </div>
  );
}

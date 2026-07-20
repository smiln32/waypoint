"use client";
import { createContext, useContext } from "react";

/**
 * Whether this is a public sample/demonstration deployment (live AI and live
 * job search both off). Read once on the server in the root layout and provided
 * here so any client component can render the demonstration banner without each
 * page having to thread the flag down.
 */
const DemoModeContext = createContext(false);

export function DemoModeProvider({
  demonstration,
  children,
}: {
  demonstration: boolean;
  children: React.ReactNode;
}) {
  return <DemoModeContext.Provider value={demonstration}>{children}</DemoModeContext.Provider>;
}

export function useDemonstration(): boolean {
  return useContext(DemoModeContext);
}

/**
 * App-wide demonstration notice. Rendered as the first child inside a page's
 * `.page` container so it is part of the page content — never a top bar that
 * pushes content down (which the workflow-page layout contract forbids).
 */
export function DemoBanner() {
  if (!useDemonstration()) return null;
  return (
    <div className="demo-banner" role="note" aria-label="Demonstration notice">
      <b>Demonstration deployment.</b> This public build of Waypoint uses fictional sample information
      to show the workflow and critique methodology. It does not run live job searches or send documents
      to an AI provider.
    </div>
  );
}

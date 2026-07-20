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
 * App-wide demonstration notice — a small, understated line near the page
 * heading (no background, no border, no full-width alert). Rendered as the first
 * child inside a page's `.page` so it is part of the page content, never a top
 * bar that pushes content down (which the workflow-page layout contract forbids).
 */
export function DemoBanner() {
  if (!useDemonstration()) return null;
  return (
    <p className="demo-note" role="note">
      Sample workspace using fictional information. Live integrations are available when enabled by the operator.
    </p>
  );
}

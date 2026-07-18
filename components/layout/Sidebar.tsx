"use client";
import type { View } from "@/lib/types";

const NAV_ITEMS: [View, string][] = [
  ["dashboard", "Dashboard"],
  ["resume", "Resume"],
  ["search", "Job Search"],
  ["jobs", "Job Tracking"],
  ["coverletter", "Cover Letter"],
  ["applications", "Application"],
  ["interview", "Interview Prep"],
];

export function Sidebar({ view, onGo }: { view: View; onGo: (view: View) => void }) {
  return (
    <aside className="side">
      <button className="logo" onClick={() => onGo("dashboard")}>
        <span>W</span>Waypoint
      </button>
      <nav>
        {NAV_ITEMS.map(([v, l]) => (
          <button className={view === v ? "active" : ""} key={v} onClick={() => onGo(v)}>
            {l}
          </button>
        ))}
      </nav>
      <p>
        <b>Your record stays yours.</b>
        <br />
        Review every change before it becomes part of your materials.
      </p>
    </aside>
  );
}

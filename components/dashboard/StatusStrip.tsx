"use client";
import type { View } from "@/lib/types";

export function StatusStrip({ onGo }: { onGo: (view: View) => void }) {
  return (
    <section className="dashboard-status" aria-label="Career transition status">
      <div>
        <b>Résumé</b>
        <strong>3</strong>
        <span>findings to resolve</span>
        <button onClick={() => onGo("resume")}>Open résumé studio</button>
      </div>
      <div>
        <b>Job search</b>
        <strong>18</strong>
        <span>new roles in saved searches</span>
        <button onClick={() => onGo("search")}>Search jobs</button>
      </div>
      <div>
        <b>Applications</b>
        <strong>2</strong>
        <span>actions due this week</span>
        <button onClick={() => onGo("applications")}>View applications</button>
      </div>
      <div>
        <b>Interview</b>
        <strong>Jul 20</strong>
        <span>AeroNorth Systems</span>
        <button onClick={() => onGo("interview")}>Practice now</button>
      </div>
    </section>
  );
}

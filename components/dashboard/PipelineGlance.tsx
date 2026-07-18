"use client";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";

export function PipelineGlance() {
  const { opportunities } = useWaypoint();
  const onGo = useGo();

  const tiles: [string, number][] = [
    ["Saved", opportunities.filter((record) => record.status === "Saved").length],
    ["Preparing", opportunities.filter((record) => record.status === "Preparing").length],
    ["Applied", opportunities.filter((record) => record.status === "Applied").length],
    ["Interviewing", opportunities.filter((record) => record.status === "Interview").length],
  ];

  return (
    <section className="dash-section" aria-label="Your pipeline">
      <div className="dash-section-head">
        <h2>Your pipeline</h2>
        <button className="link" onClick={() => onGo("applications")}>
          Open Job Tracking →
        </button>
      </div>
      <div className="pipeline-glance">
        {tiles.map(([label, count]) => (
          <div key={label}>
            <b>{count}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

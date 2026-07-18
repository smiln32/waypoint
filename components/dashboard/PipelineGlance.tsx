"use client";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";

export function PipelineGlance() {
  const { applications } = useWaypoint();
  const onGo = useGo();

  const tiles: [string, number][] = [
    ["Saved", applications.filter((row) => row.stage === "Saved").length],
    ["Preparing", applications.filter((row) => row.stage === "Preparing").length],
    ["Applied", applications.filter((row) => row.stage === "Applied").length],
    ["Interviewing", applications.filter((row) => row.stage.startsWith("Interview")).length],
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

"use client";
import { findings } from "@/lib/demo-data";
import { useGo } from "@/lib/use-go";

export function MaterialsRow() {
  const onGo = useGo();
  return (
    <section className="dash-section" aria-label="Your materials">
      <div className="dash-section-head">
        <h2>Your materials</h2>
      </div>
      <div className="materials-row">
        <div>
          <b>Resume</b>
          <span>
            {findings.length} finding{findings.length === 1 ? "" : "s"} open
          </span>
          <small>Work through them in Resume Studio, then resubmit for evaluation.</small>
          <button className="link" onClick={() => onGo("resume")}>
            Review resume →
          </button>
        </div>
        <div>
          <b>Cover Letter</b>
          <span>Draft in progress</span>
          <small>Connect your verified experience to one employer and role.</small>
          <button className="link" onClick={() => onGo("coverletter")}>
            Open letter →
          </button>
        </div>
      </div>
    </section>
  );
}

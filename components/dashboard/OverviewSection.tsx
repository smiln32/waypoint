"use client";
import { Panel } from "@/components/ui/Panel";
import { useGo } from "@/lib/use-go";

export function OverviewSection() {
  const onGo = useGo();
  return (
    <section className="dashboard-overview overview-page" id="dashboard-overview">
      <section className="hero">
        <div>
          <small>NEXT DECISION</small>
          <h2>Resolve three resume editor findings</h2>
          <p>
            Your operations resume has strong evidence, but three passages still rely on military shorthand or
            unclear authority.
          </p>
          <button onClick={() => onGo("resume")}>Review findings</button>
        </div>
        <strong>
          72%<small>ready</small>
        </strong>
      </section>
      <div className="cols">
        <Panel title="Application pipeline">
          <div className="pipeline">
            {[
              ["8", "Saved"],
              ["5", "Applied"],
              ["2", "Interviewing"],
              ["1", "Follow-up"],
            ].map((x) => (
              <span key={x[1]}>
                <b>{x[0]}</b>
                {x[1]}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Strongest match">
          <em>88% fit</em>
          <h3>Technical Operations Manager</h3>
          <p>AeroNorth Systems · Jacksonville, FL</p>
          <button className="link" onClick={() => onGo("applications")}>
            See match reasoning →
          </button>
        </Panel>
      </div>
      <Panel title="Recent work">
        <div className="activity">
          <b>Resume draft 2 reviewed</b>
          <span>3 decisions waiting</span>
          <button onClick={() => onGo("resume")}>Continue</button>
        </div>
        <div className="activity">
          <b>Leadership interview practice</b>
          <span>Ownership improved from 2 to 3</span>
          <button onClick={() => onGo("interview")}>Practice again</button>
        </div>
      </Panel>
    </section>
  );
}

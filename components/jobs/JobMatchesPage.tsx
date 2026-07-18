"use client";
import { Heading } from "@/components/ui/Heading";
import { matches } from "@/lib/demo-data";
import { useGo } from "@/lib/use-go";

export function JobMatchesPage() {
  const onGo = useGo();
  return (
    <div className="page">
      <Heading
        kicker="JOB MATCHES"
        title="Roles worth your time."
        text="Fit is evidence, not a verdict. Every score shows what supports it."
      />
      <div className="jobs">
        {matches.map((j) => (
          <article key={j[1]}>
            <strong>
              {j[0]}
              <small>fit</small>
            </strong>
            <div>
              <h2>{j[1]}</h2>
              <p>
                {j[2]} · {j[3]}
              </p>
              <span>Maintenance leadership</span> <span>Safety systems</span>
            </div>
            <section>
              <small>QUALIFICATION TO ADDRESS</small>
              <b>{j[4]}</b>
              <button className="link" onClick={() => onGo("interview")}>
                Prepare for this role →
              </button>
            </section>
          </article>
        ))}
      </div>
    </div>
  );
}

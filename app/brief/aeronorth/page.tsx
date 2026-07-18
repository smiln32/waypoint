import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Brief — AeroNorth Systems · Waypoint",
};

/**
 * A pre-interview company brief. Opens in its own tab from Job Tracking so it
 * can sit beside the interview-prep workspace.
 */
export default function Page() {
  return (
    <div className="page brief-page">
      <div className="heading">
        <small>COMPANY BRIEF</small>
        <h1>AeroNorth Systems</h1>
        <p>Prepared for: Technical Operations Manager interview · Jordan Lee, Operations Director</p>
      </div>
      <article className="paper brief-paper">
        <h4>WHO THEY ARE</h4>
        <p>
          AeroNorth Systems provides contract fleet support — maintenance planning, parts logistics, and
          readiness reporting — for regional cargo and government aviation operators in the Southeast. About
          420 employees; the Jacksonville operation runs three maintenance lines across two shifts.
        </p>
        <h4>WHAT THE ROLE OWNS</h4>
        <p>
          The Technical Operations Manager runs daily maintenance priorities across the lines: sequencing
          work, balancing parts availability against the flying schedule, and briefing readiness to both
          AeroNorth leadership and the customer. Roughly 20 technicians report through two shift leads.
        </p>
        <h4>WHY YOUR RECORD FITS</h4>
        <p>
          The daily tension in this job — safety, schedule, parts, and people pulling against each other —
          is the tension you managed for four years. Lead with the decision-making rhythm: how you set
          priorities each morning, what evidence you used, and how you kept accountability clean.
        </p>
        <h4>LIKELY QUESTIONS</h4>
        <p>
          Expect at least one of each: a time you missed a deadline and what you changed; how you handle a
          technician who signs off work you doubt; how you would learn their planning system in the first
          month. Bring one verifiable number per answer — never one you cannot defend.
        </p>
        <h4>ONE HONEST GAP</h4>
        <p>
          You have not owned a budget. If asked, say so plainly, then describe the closest verified
          equivalent: accountability for $500,000 of equipment with clean audits, and the discipline that
          record required.
        </p>
      </article>
    </div>
  );
}

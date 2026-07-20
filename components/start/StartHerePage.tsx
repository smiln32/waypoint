"use client";
import { HowItWorks } from "./HowItWorks";

export function StartHerePage() {
  return (
    <div className="page">
      <div className="heading">
        <small>START HERE</small>
        <h1>Turn Your Military Experience Into Civilian Opportunity</h1>
        <p>
          Waypoint helps recently separated service members make verified military experience
          understandable to civilian employers without inventing or overstating qualifications.
        </p>
      </div>
      <HowItWorks />
    </div>
  );
}

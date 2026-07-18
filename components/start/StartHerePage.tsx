"use client";
import { HowItWorks } from "./HowItWorks";

export function StartHerePage() {
  return (
    <div className="page">
      <div className="heading">
        <small>START HERE</small>
        <h1>Welcome to Waypoint.</h1>
        <p>
          Waypoint walks you through five steps, from resume to interview. Each one below opens the
          workspace where it happens — begin with step one.
        </p>
      </div>
      <HowItWorks />
    </div>
  );
}

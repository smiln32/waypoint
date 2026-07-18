"use client";
import { useSyncExternalStore } from "react";
import type { CompanyBrief } from "@/lib/briefs";
import { loadPersisted } from "@/lib/persist";

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function BriefView({ slug }: { slug: string }) {
  const mounted = useMounted();
  if (!mounted) return null;

  const briefs = loadPersisted<Record<string, CompanyBrief>>("waypoint.briefs") ?? {};
  const brief = briefs[slug];

  if (!brief) {
    return (
      <div className="page brief-page">
        <div className="heading">
          <small>COMPANY BRIEF</small>
          <h1>No brief found.</h1>
          <p>Generate one from Job Tracking — each position has a “Generate company brief” action.</p>
        </div>
      </div>
    );
  }

  const generated = new Date(brief.generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="page brief-page">
      <div className="heading">
        <small>COMPANY BRIEF</small>
        <h1>{brief.company}</h1>
        <p>
          Prepared for: {brief.role} · Generated {generated} by the Waypoint brief writer
        </p>
      </div>
      <article className="paper brief-paper">
        <h4>WHO THEY ARE</h4>
        <p>{brief.sections.whoTheyAre}</p>
        <h4>WHAT THE ROLE OWNS</h4>
        <p>{brief.sections.whatTheRoleOwns}</p>
        <h4>WHY YOUR RECORD FITS</h4>
        <p>{brief.sections.whyYourRecordFits}</p>
        <h4>LIKELY QUESTIONS</h4>
        <p>{brief.sections.likelyQuestions}</p>
        <h4>ONE HONEST GAP</h4>
        <p>{brief.sections.honestGap}</p>
      </article>
    </div>
  );
}

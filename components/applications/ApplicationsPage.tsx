"use client";
import { useState } from "react";
import {
  briefSlug,
  resumeTextFromStorage,
  type CompanyBrief,
} from "@/lib/briefs";
import { Heading } from "@/components/ui/Heading";
import {
  formatFriendlyDate,
  formatOpportunityDetail,
  nextActionViewFor,
  statusClassFor,
} from "@/lib/opportunities";
import { useWaypoint } from "@/lib/store";
import { PRE_APPLICATION_STATUSES, type OpportunityRecord } from "@/lib/types";
import { useGo } from "@/lib/use-go";
import { AddPositionForm } from "./AddPositionForm";

export function ApplicationsPage() {
  const { opportunities, briefs, saveBrief, startApplication, note } =
    useWaypoint();
  const onGo = useGo();
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);

  const generateBrief = async (record: OpportunityRecord) => {
    const slug = briefSlug(record.company, record.role);
    setGeneratingSlug(slug);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: record.company,
          role: record.role,
          detail: formatOpportunityDetail(record),
          resumeText: resumeTextFromStorage(),
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        note(payload.error ?? "Brief generation failed — try again.");
      } else {
        const brief = (await res.json()) as CompanyBrief;
        saveBrief(brief);
        note("Company brief ready");
      }
    } catch {
      note("Brief generation failed — try again.");
    }
    setGeneratingSlug(null);
  };

  const activeCount = opportunities.filter(
    (record) => record.status !== "Closed",
  ).length;
  const interviewCount = opportunities.filter(
    (record) => record.status === "Interview",
  ).length;
  const scheduledCount = opportunities.filter((record) =>
    Boolean(record.nextAction.dueDate),
  ).length;
  const missingDueCount = opportunities.length - scheduledCount;
  const activeStageCount = new Set(
    opportunities
      .filter((record) => record.status !== "Closed")
      .map((record) => record.status),
  ).size;

  return (
    <div className="page">
      <Heading
        kicker="JOB TRACKING"
        title="Nothing gets lost."
        text="Keep every posting, tailored document, contact, deadline, and follow-up in one place."
      />
      <div className="application-summary">
        <section>
          <b>{activeCount}</b>
          <span>Active</span>
          <small>
            {activeStageCount === 0
              ? "No active stages"
              : `${activeStageCount} active hiring stage${activeStageCount === 1 ? "" : "s"}`}
          </small>
        </section>
        <section>
          <b>{interviewCount}</b>
          <span>Interview{interviewCount === 1 ? "" : "s"}</span>
          <small>
            {interviewCount === 0
              ? "No interviews scheduled"
              : `${interviewCount} interview${interviewCount === 1 ? "" : "s"}`}
          </small>
        </section>
        <section>
          <b>
            {scheduledCount}/{opportunities.length}
          </b>
          <span>Follow-ups scheduled</span>
          <small>
            {missingDueCount === 0
              ? "Every position has a date"
              : `${missingDueCount} position${missingDueCount === 1 ? " needs" : "s need"} a date`}
          </small>
        </section>
      </div>
      <div className="application-toolbar">
        <span>
          {opportunities.length} position{opportunities.length === 1 ? "" : "s"}{" "}
          tracked
        </span>
        <AddPositionForm />
      </div>
      <div className="application-table">
        <table>
          <caption className="sr-only">Tracked job opportunities and next actions</caption>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Stage</th>
              <th scope="col">Materials</th>
              <th scope="col">Contact</th>
              <th scope="col">Next action</th>
              <th scope="col">Due</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={6}>No positions tracked yet. Save a role from Job Search or add one here.</td>
              </tr>
            )}
            {opportunities.map((record) => {
              const actionView = nextActionViewFor(record.nextAction.kind);
              const slug = briefSlug(record.company, record.role);
              const brief = briefs[slug];
              return (
                <tr key={record.id}>
                  <td>
                    <b>{record.role}</b>
                    <small>{formatOpportunityDetail(record)}</small>
                  </td>
                  <td>
                    <span className={`stage ${statusClassFor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {record.materials.resume}
                    <small>{record.materials.coverLetter}</small>
                  </td>
                  <td>
                    {record.contact?.name ?? "No contact yet"}
                    <small>
                      {record.contact?.relationship ?? record.location ?? ""}
                    </small>
                  </td>
                  <td>
                    {PRE_APPLICATION_STATUSES.includes(record.status) && (
                      <button
                        className="secondary"
                        onClick={() => {
                          startApplication(record.id);
                          note(record.role + " moved to Applications");
                        }}
                      >
                        Start Application
                      </button>
                    )}
                    {actionView ? (
                      <button
                        className="link next-action"
                        onClick={() => onGo(actionView)}
                      >
                        {record.nextAction.label} →
                      </button>
                    ) : (
                      <b>{record.nextAction.label}</b>
                    )}
                    {record.nextAction.detail && (
                      <small>{record.nextAction.detail}</small>
                    )}
                    <small>
                      {brief ? (
                        <a
                          href={`/brief/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Company brief ready ↗
                        </a>
                      ) : (
                        <button
                          className="brief-generate"
                          disabled={generatingSlug === slug}
                          onClick={() => generateBrief(record)}
                        >
                          {generatingSlug === slug
                            ? "Generating brief…"
                            : "Generate company brief"}
                        </button>
                      )}
                    </small>
                  </td>
                  <td>
                    {formatFriendlyDate(record.nextAction.dueDate) || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

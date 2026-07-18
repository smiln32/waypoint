"use client";
import { useState } from "react";
import { briefSlug, resumeTextFromStorage, type CompanyBrief } from "@/lib/briefs";
import { Heading } from "@/components/ui/Heading";
import { useWaypoint } from "@/lib/store";
import type { ApplicationRow } from "@/lib/types";
import { useGo } from "@/lib/use-go";
import { AddPositionForm } from "./AddPositionForm";

export function ApplicationsPage() {
  const { applications, briefs, saveBrief, note } = useWaypoint();
  const onGo = useGo();
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);

  const generateBrief = async (row: ApplicationRow) => {
    const company = row.roleDetail.split(" · ")[0];
    const slug = briefSlug(company, row.role);
    setGeneratingSlug(slug);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role: row.role,
          detail: row.roleDetail,
          resumeText: resumeTextFromStorage(),
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
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
  return (
    <div className="page">
      <Heading
        kicker="JOB TRACKING"
        title="Nothing gets lost."
        text="Keep every posting, tailored document, contact, deadline, and follow-up in one place."
      />
      <div className="application-summary">
        <section>
          <b>5</b>
          <span>Active</span>
          <small>Across three hiring stages</small>
        </section>
        <section>
          <b>2</b>
          <span>Interviews</span>
          <small>Next: AeroNorth, July 20</small>
        </section>
        <section>
          <b>4/5</b>
          <span>Follow-ups scheduled</span>
          <small>One application needs a date</small>
        </section>
      </div>
      <div className="application-toolbar">
        <span>
          {applications.length} position{applications.length === 1 ? "" : "s"} tracked
        </span>
        <AddPositionForm />
      </div>
      <div className="application-table">
        <table>
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
            {applications.map((row) => (
              <tr key={row.role}>
                <td>
                  <b>{row.role}</b>
                  <small>{row.roleDetail}</small>
                </td>
                <td>
                  <span className={`stage ${row.stageClass}`}>{row.stage}</span>
                </td>
                <td>
                  {row.materials}
                  <small>{row.materialsDetail}</small>
                </td>
                <td>
                  {row.contact}
                  <small>{row.contactDetail}</small>
                </td>
                <td>
                  {row.nextActionView ? (
                    <button className="link next-action" onClick={() => onGo(row.nextActionView!)}>
                      {row.nextAction} →
                    </button>
                  ) : (
                    <b>{row.nextAction}</b>
                  )}
                  {row.nextActionDetailHref ? (
                    <small>
                      <a href={row.nextActionDetailHref} target="_blank" rel="noopener noreferrer">
                        {row.nextActionDetail} ↗
                      </a>
                    </small>
                  ) : (
                    (() => {
                      const slug = briefSlug(row.roleDetail.split(" · ")[0], row.role);
                      const brief = briefs[slug];
                      return (
                        <>
                          {row.nextActionDetail && <small>{row.nextActionDetail}</small>}
                          <small>
                            {brief ? (
                              <a href={`/brief/${slug}`} target="_blank" rel="noopener noreferrer">
                                Company brief ready ↗
                              </a>
                            ) : (
                              <button
                                className="brief-generate"
                                disabled={generatingSlug === slug}
                                onClick={() => generateBrief(row)}
                              >
                                {generatingSlug === slug ? "Generating brief…" : "Generate company brief"}
                              </button>
                            )}
                          </small>
                        </>
                      );
                    })()
                  )}
                </td>
                <td>{row.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

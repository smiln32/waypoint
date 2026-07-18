"use client";
import { Heading } from "@/components/ui/Heading";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";
import { AddPositionForm } from "./AddPositionForm";

export function ApplicationsPage() {
  const { applications } = useWaypoint();
  const onGo = useGo();
  return (
    <div className="page">
      <Heading
        kicker="JOB TRACKING"
        title="Nothing gets lost."
        text="Keep every posting, tailored document, contact, deadline, and follow-up in one place."
      />
      <div className="application-actions">
        <AddPositionForm />
        <span>
          {applications.length} position{applications.length === 1 ? "" : "s"} tracked
        </span>
      </div>
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
      <div className="application-table">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Stage</th>
              <th>Materials</th>
              <th>Contact</th>
              <th>Next action</th>
              <th>Due</th>
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
                    <small>{row.nextActionDetail}</small>
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

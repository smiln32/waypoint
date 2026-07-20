"use client";
import type { RefObject } from "react";

/**
 * The editable resume document. The article's inner HTML is owned by the
 * contentEditable DOM (history snapshots restore innerHTML), so this JSX only
 * provides the initial content — do not wrap it conditionally or key it.
 */
export function ResumePaper({
  paperRef,
  onFocus,
  onInput,
}: {
  paperRef: RefObject<HTMLElement | null>;
  onFocus: () => void;
  onInput: () => void;
}) {
  return (
    <article
      className="paper editable-paper"
      ref={paperRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      aria-label="Editable resume"
      onFocus={onFocus}
      onInput={onInput}
    >
      <h1>James Carter</h1>
      <p>Maintenance Operations Supervisor</p>
      <p>Jacksonville, NC · (555) 014-2876 · james.carter@example.com</p>
      <hr />
      <h2>PROFILE</h2>
      <p>
        Dedicated military professional with nearly eight years of experience supporting maintenance
        operations, personnel readiness, and equipment accountability. Known for reliability, discipline,
        and strong leadership. Planned and carried out operations and training, consistently meeting
        deadlines and standards. Experienced in supervising personnel, managing competing priorities, and
        ensuring work is completed safely and efficiently.
      </p>
      <h2>EXPERIENCE</h2>
      <h3>Maintenance Control Supervisor · United States Marine Corps</h3>
      <p>Camp Lejeune, NC · Jun 2021–May 2025</p>
      <ul>
        <li>Coordinated daily maintenance priorities for 12 tactical vehicles and led 18 Marines across two
          shifts.</li>
        <li>Managed inspections, repair schedules, work orders, parts requests, and equipment-readiness
          reports.</li>
        <li>Ensured maintenance activities were completed safely, accurately, and on time.</li>
        <li>Trained junior Marines and provided guidance on proper maintenance procedures.</li>
        <li>Worked with leadership to resolve equipment problems and support mission requirements.</li>
        <li>Completed an overseas deployment and earned recognition for leadership and dependability.</li>
      </ul>
      <h3>Maintenance Management Specialist · United States Marine Corps</h3>
      <p>Camp Pendleton, CA · Aug 2017–Jun 2021 · Promoted to Corporal</p>
      <ul>
        <li>Maintained records for more than 60 vehicles and pieces of support equipment.</li>
        <li>Monitored work orders and helped ensure equipment remained mission capable.</li>
        <li>Performed quality-control checks and reported maintenance concerns to supervisors.</li>
        <li>Assisted with inventory counts, tool accountability, and replacement-parts requests.</li>
        <li>Supported field exercises and other unit operations as required.</li>
      </ul>
      <h2>EDUCATION &amp; TRAINING</h2>
      <p>Business Administration Coursework — Coastal Carolina Community College, 2023–2025</p>
      <p>Corporals Course — United States Marine Corps, 2020</p>
      <p>Maintenance Management Specialist Course — United States Marine Corps, 2017</p>
      <h2>SKILLS</h2>
      <p>Maintenance Planning · Personnel Supervision · Equipment Readiness · Work-Order Management</p>
      <p>Inventory Accountability · Leadership · Communication · Microsoft Office</p>
      <h2>ADDITIONAL INFORMATION</h2>
      <ul>
        <li>Honorable discharge · Valid driver&apos;s license</li>
        <li>Available for travel and relocation</li>
        <li>Volunteer with a local veterans&apos; organization</li>
      </ul>
    </article>
  );
}

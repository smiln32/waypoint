"use client";
import type { RefObject } from "react";

/**
 * The editable résumé document. The article's inner HTML is owned by the
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
      aria-label="Editable operations résumé"
      onFocus={onFocus}
      onInput={onInput}
    >
      <h1>Alex Morgan</h1>
      <p>Jacksonville, FL · alex.morgan@example.com · (555) 014-7821</p>
      <p>Aviation Maintenance Control | Technical Operations</p>
      <hr />
      <h4>PROFESSIONAL SUMMARY</h4>
      <p>
        Marine Corps aviation maintenance professional with eight years of experience coordinating flight-line
        maintenance, avionics troubleshooting, personnel, and safety-critical documentation for F/A-18 aircraft.
        CompTIA Security+ certified and completing a B.S. in Organizational Leadership.
      </p>
      <h4>EXPERIENCE</h4>
      <h3>Maintenance Control Supervisor · U.S. Marine Corps · MCAS Beaufort, SC</h3>
      <p>2020–2024</p>
      <ul>
        <li>
          Coordinated daily maintenance priorities for 12 F/A-18 aircraft across three shifts, tracking
          discrepancies, parts status, and release-to-service documentation.
        </li>
        <li>Led 18 technicians and maintained a 96% MC rate during high-tempo flight operations.</li>
        <li>
          Briefed maintenance status, safety risks, and resource constraints to squadron leadership before daily
          flight scheduling decisions.
        </li>
      </ul>
      <h3>Aircraft Avionics Technician · U.S. Marine Corps · Iwakuni, Japan</h3>
      <p>2016–2020</p>
      <ul>
        <li>
          Diagnosed and repaired radar, navigation, communication, and flight-control system discrepancies on
          F/A-18 aircraft.
        </li>
        <li>Resolved complex avionics discrepancies under time pressure.</li>
        <li>
          Trained six junior technicians on fault-isolation procedures, technical publications, and tool-control
          requirements.
        </li>
      </ul>
      <h3>Collateral Duty Information Systems Security Manager</h3>
      <p>Served as the company’s Chief Information Security Officer.</p>
      <h4>EDUCATION &amp; CREDENTIALS</h4>
      <p>B.S. Organizational Leadership, University of North Florida · Expected 2027</p>
      <p>CompTIA Security+</p>
    </article>
  );
}

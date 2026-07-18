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
      <p>Jacksonville, NC · (910) 555-0148 · jcarter88@email.com</p>
      <hr />
      <h4>SUMMARY</h4>
      <p>
        U.S. Marine Corps veteran with six years of experience leading teams, managing equipment, and
        getting results under pressure. Known for reliability, discipline, and strong leadership. Looking to
        bring these skills to a civilian team in operations, logistics, or a related field.
      </p>
      <h4>EXPERIENCE</h4>
      <h3>Team Leader / Sergeant (E-5), Infantry · United States Marine Corps</h3>
      <p>2019–2025</p>
      <ul>
        <li>Supervised and trained a team of up to 12 people, managing their performance, safety, and daily
          tasks.</li>
        <li>Maintained 100% accountability of equipment valued at over $500,000 with no losses.</li>
        <li>Planned and carried out operations and training, consistently meeting deadlines and standards.</li>
        <li>Mentored junior team members, several of whom were promoted based on their performance.</li>
        <li>Completed an overseas deployment and earned recognition for leadership and dependability.</li>
      </ul>
      <h4>EDUCATION &amp; TRAINING</h4>
      <p>High School Diploma — Lincoln High School, Dayton, OH, 2018</p>
      <p>Leadership Training: Completed Marine Corps leadership courses (supervisor-level).</p>
      <h4>SKILLS</h4>
      <p>Team Leadership · Training &amp; Mentoring · Operations Planning · Time Management</p>
      <p>Problem Solving · Attention to Detail · Microsoft Office · Works Well Under Pressure</p>
      <h4>AWARDS &amp; CLEARANCE</h4>
      <ul>
        <li>Navy and Marine Corps Achievement Medal, Good Conduct Medal</li>
        <li>Active Secret Security Clearance</li>
      </ul>
    </article>
  );
}

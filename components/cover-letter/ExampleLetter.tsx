"use client";
import { useState } from "react";
import type { CoverLetterExample } from "@/lib/cover-letter-example.server";

export function ExampleLetter({ example }: { example: CoverLetterExample | null }) {
  const [open, setOpen] = useState(false);
  if (!example) return null;
  return (
    <section className="example-letter" aria-label="Example cover letter">
      <button type="button" className="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Hide the example letter" : "See an example cover letter"}
      </button>
      {open && (
        <div className="example-letter-body">
          <pre>{example.letter}</pre>
          {example.notes.length > 0 && (
            <div className="example-letter-notes">
              <b>Why this letter works</b>
              <ul>
                {example.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

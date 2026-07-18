"use client";
import type { RefObject } from "react";

/**
 * Top-of-page intake: one card per way of adding a resume.
 * A third card (build from scratch) is planned; the grid is ready for it.
 */
export function ResumeIntake({
  fileRef,
  importText,
  onImportTextChange,
  onUpload,
  onUsePasted,
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  importText: string;
  onImportTextChange: (text: string) => void;
  onUpload: (file?: File) => void;
  onUsePasted: () => void;
}) {
  return (
    <section className="resume-intake" aria-label="Add your resume">
      <div className="intake-heading">
        <h2>Add your resume</h2>
        <p>Start with the resume you have. It becomes the editable draft below, ready for review.</p>
      </div>
      <div className="intake-grid">
        <section className="intake-card intake-upload">
          <h3>Upload a file</h3>
          <span>TXT, MD, or RTF for this demo. The file stays on your machine.</span>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.rtf,text/plain,text/markdown,application/rtf"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
            Upload resume
          </button>
        </section>
        <section className="intake-card">
          <h3>Paste the text</h3>
          <span>Copy the resume from any document and paste it here.</span>
          <textarea
            rows={9}
            value={importText}
            onChange={(e) => onImportTextChange(e.target.value)}
            placeholder="Paste the resume here"
            aria-label="Paste resume text"
          />
          <button
            type="button"
            className="secondary"
            disabled={!importText.trim()}
            onClick={onUsePasted}
          >
            Use pasted resume
          </button>
        </section>
      </div>
    </section>
  );
}

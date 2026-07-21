"use client";
import type { RefObject } from "react";

/**
 * Top-of-page intake: one card per way of adding a resume.
 * A third card (build from scratch) is planned; the grid is ready for it.
 *
 * In the public sample demonstration there is no AI model, so an uploaded or
 * pasted résumé could not be critiqued honestly (the offline evaluator only
 * recognizes the seeded sample). The intake structure stays visible so the
 * workflow reads correctly, but the controls are disabled and say why.
 */
export function ResumeIntake({
  liveAiEnabled,
  fileRef,
  importText,
  onImportTextChange,
  onUpload,
  onUsePasted,
}: {
  liveAiEnabled: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  importText: string;
  onImportTextChange: (text: string) => void;
  onUpload: (file?: File) => void;
  onUsePasted: () => void;
}) {
  const disabled = !liveAiEnabled;
  return (
    <section className="resume-intake" aria-label="Add your resume">
      <div className="intake-heading">
        <h2>1. Add Your Resume</h2>
        {disabled ? (
          <p>
            This demonstration starts from a fictional sample résumé, shown in the editable draft below.
            Uploading or pasting your own résumé is turned off here — an honest review needs the live AI
            editor, which this public demo does not run. Edit the sample freely to see how the critique responds.
          </p>
        ) : (
          <p>Start with the resume you have. It becomes the editable draft below, ready for review.</p>
        )}
      </div>
      <div className="intake-grid">
        <section className="intake-card intake-upload">
          <h3>Upload a file</h3>
          <span>
            {disabled
              ? "PDF, DOCX, TXT, MD, or RTF. Available when the live AI editor is enabled."
              : "PDF, DOCX, TXT, MD, or RTF. Parsed in your browser — the file never leaves your machine."}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/rtf"
            disabled={disabled}
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          <button
            type="button"
            className="secondary"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
          >
            Upload resume
          </button>
        </section>
        <section className="intake-card">
          <h3>Paste the text</h3>
          <span>
            {disabled
              ? "Copy the resume from any document. Available when the live AI editor is enabled."
              : "Copy the resume from any document and paste it here."}
          </span>
          <textarea
            rows={9}
            value={importText}
            onChange={(e) => onImportTextChange(e.target.value)}
            placeholder={disabled ? "Available with the live AI editor" : "Paste the resume here"}
            aria-label="Paste resume text"
            disabled={disabled}
          />
          <button
            type="button"
            className="secondary"
            disabled={disabled || !importText.trim()}
            onClick={onUsePasted}
          >
            Use pasted resume
          </button>
        </section>
      </div>
    </section>
  );
}

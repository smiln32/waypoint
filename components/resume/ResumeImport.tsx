"use client";
import type { RefObject } from "react";

export function ResumeImport({
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
    <section className="resume-import" aria-label="Add your résumé">
      <div>
        <b>Add your résumé</b>
        <span>Upload a text résumé or paste its contents below.</span>
      </div>
      <div className="resume-import-actions">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.rtf,text/plain,text/markdown,application/rtf"
          onChange={(e) => onUpload(e.target.files?.[0])}
        />
        <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
          Upload résumé
        </button>
      </div>
      <label>
        <span>Paste résumé text</span>
        <textarea
          rows={4}
          value={importText}
          onChange={(e) => onImportTextChange(e.target.value)}
          placeholder="Paste the résumé here"
        />
      </label>
      <button
        type="button"
        className="secondary apply-paste"
        disabled={!importText.trim()}
        onClick={onUsePasted}
      >
        Use pasted résumé
      </button>
    </section>
  );
}

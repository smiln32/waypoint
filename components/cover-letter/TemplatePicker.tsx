"use client";
import type { CoverLetterTemplate } from "@/lib/cover-letter-templates.server";

export function TemplatePicker({
  templates,
  onPick,
}: {
  templates: CoverLetterTemplate[];
  onPick: (template: CoverLetterTemplate) => void;
}) {
  if (!templates.length) return null;
  return (
    <section className="template-picker" aria-label="Cover letter templates">
      <div className="template-picker-intro">
        <h2>Not sure how to start?</h2>
        <p>
          Load a structure, then replace every bracket with your own facts. The template is the shape of a
          strong letter — the substance stays yours, and the editor reviews whatever you write.
        </p>
      </div>
      <div className="template-list">
        {templates.map((template) => (
          <button key={template.name} type="button" onClick={() => onPick(template)}>
            <b>{template.name}</b>
            <span>{template.description}</span>
            <em>Use this structure →</em>
          </button>
        ))}
      </div>
    </section>
  );
}

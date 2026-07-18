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
          Each template is a letter with the sentences already written — you replace the bracketed parts
          with your own facts. Open the finished example to see how one reads when it&apos;s done. The editor
          reviews whatever you write.
        </p>
      </div>
      <div className="template-list">
        {templates.map((template) => (
          <article key={template.name}>
            <b>{template.name}</b>
            <span>{template.description}</span>
            <button type="button" className="secondary" onClick={() => onPick(template)}>
              Use this structure
            </button>
            {template.example && (
              <details>
                <summary>See a finished example</summary>
                <pre>{template.example}</pre>
              </details>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

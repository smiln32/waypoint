import DOMPurify from "dompurify";

/**
 * Sanitize résumé HTML before it is written back into the editable document.
 *
 * The résumé lives in a contentEditable article. Its innerHTML is persisted to
 * localStorage and snapshotted for undo/redo, then re-inserted via `innerHTML`
 * on restore. Without sanitizing, an `<img onerror=…>` / `<svg onload=…>` /
 * event-handler attribute pasted into the editor would re-execute when that
 * stored markup is written back (a self-XSS on reload or undo/redo).
 *
 * DOMPurify's default profile strips scripts, event-handler attributes, and
 * `javascript:` URLs while leaving the résumé's semantic markup — headings,
 * paragraphs, lists, `<hr>`, `<strong>`/`<em>`, and the finding highlights
 * (`<mark class="resume-flag" data-finding-index>`, since `class` and `data-*`
 * attributes are preserved by default) — and all text content untouched. Using
 * the default profile (rather than a hand-picked allowlist) is the choice least
 * likely to drop legitimate content the editor produces.
 */
export function sanitizeResumeHtml(html: string): string {
  // Only ever called client-side (restore effect + undo/redo handler); the guard
  // is defensive so a stray SSR evaluation can never call into DOMPurify without
  // a DOM. It never suppresses sanitizing in the browser, where window is present.
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html);
}

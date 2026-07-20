"use client";

/**
 * Shown whenever a critique came from the offline demo evaluators instead of
 * the real AI editor — the demo must never pass for the real thing.
 */
export function DemoNotice({ source }: { source: "claude" | "demo" | null }) {
  if (source !== "demo") return null;
  return (
    <p className="demo-notice" role="status">
      <b>Sample critique.</b> These are demonstration results produced without an AI model, shown to
      illustrate the editor&apos;s standards on the sample document.
    </p>
  );
}

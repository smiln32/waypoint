"use client";

/**
 * Shown whenever a critique came from the offline demo evaluators instead of
 * the real AI editor — the demo must never pass for the real thing.
 */
export function DemoNotice({ source }: { source: "claude" | "demo" | null }) {
  if (source !== "demo") return null;
  return (
    <p className="demo-notice" role="status">
      <b>Demo findings.</b> The AI editor is not connected — add <code>ANTHROPIC_API_KEY</code> to{" "}
      <code>.env.local</code> and restart to enable real critiques.
    </p>
  );
}

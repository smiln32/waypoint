"use client";

/**
 * Shown whenever a critique came from the offline demo evaluators instead of
 * the real AI editor — the demo must never pass for the real thing.
 */
export function DemoNotice({ source }: { source: "claude" | "demo" | null }) {
  if (source !== "demo") return null;
  return (
    <p className="demo-notice" role="status">
      <b>Limited sample review.</b> These deterministic demonstration results check a small set of patterns
      without an AI model. They are not a complete review.
    </p>
  );
}

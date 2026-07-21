export function AiPrivacyNotice({ liveAiEnabled = false }: { liveAiEnabled?: boolean }) {
  if (!liveAiEnabled) {
    return (
      <aside className="ai-privacy-notice" aria-label="AI privacy notice">
        <b>No external AI provider</b>
        <p>When you submit, Waypoint uses deterministic sample logic for this limited review. The text is <b>not</b> sent to an external AI provider.</p>
        <p>Full ICM-guided AI review is available only when enabled by the operator.</p>
      </aside>
    );
  }
  return (
    <aside className="ai-privacy-notice" aria-label="AI privacy notice">
      <b>Before you submit</b>
      <p>Your document is stored in this browser. When you submit it for evaluation, the text shown here is sent to the configured AI provider for review.</p>
      <p>Remove Social Security and service numbers, home addresses, medical information, classified or controlled information, and other unnecessary personal details.</p>
    </aside>
  );
}

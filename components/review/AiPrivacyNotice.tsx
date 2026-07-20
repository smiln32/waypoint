export function AiPrivacyNotice({ liveAiEnabled = false }: { liveAiEnabled?: boolean }) {
  if (!liveAiEnabled) {
    return (
      <aside className="ai-privacy-notice" aria-label="AI privacy notice">
        <b>Your document stays in your browser</b>
        <p>This is a demonstration deployment. Evaluation runs on built-in sample logic — the text is <b>not</b> sent to any AI provider.</p>
        <p>Live AI review is turned off here; an operator can enable it with their own key.</p>
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

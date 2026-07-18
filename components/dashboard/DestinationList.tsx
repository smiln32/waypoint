"use client";
import type { View } from "@/lib/types";

export function DestinationList({ onGo }: { onGo: (view: View) => void }) {
  return (
    <section className="dashboard-destinations">
      <div>
        <h2>Build your materials</h2>
        <p>Keep every claim accurate, understandable, and under your control.</p>
      </div>
      <div className="destination-list">
        <button onClick={() => onGo("resume")}>
          <b>Résumé Studio</b>
          <span>Translate military experience and review editor findings.</span>
          <em>Start a Resume →</em>
        </button>
        <button onClick={() => onGo("coverletter")}>
          <b>Cover Letter Studio</b>
          <span>Connect verified experience to one specific employer and role.</span>
          <em>Start a letter →</em>
        </button>
      </div>
    </section>
  );
}

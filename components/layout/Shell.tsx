"use client";
import { useWaypoint } from "@/lib/store";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { toast } = useWaypoint();
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <main className="work" id="main" tabIndex={-1}>
        {children}
      </main>
      {toast && (
        <div className="toast" role="status" aria-live="polite" aria-atomic="true">
          {toast}
        </div>
      )}
    </div>
  );
}

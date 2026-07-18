"use client";
import { useWaypoint } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { toast } = useWaypoint();
  return (
    <main className="shell">
      <Sidebar />
      <section className="work">
        <Topbar />
        {children}
      </section>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

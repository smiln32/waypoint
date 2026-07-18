"use client";
import { useState } from "react";
import { ApplicationsPage } from "@/components/applications/ApplicationsPage";
import { CoverLetterPage } from "@/components/cover-letter/CoverLetterPage";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { InterviewPage } from "@/components/interview/InterviewPage";
import { JobMatchesPage } from "@/components/jobs/JobMatchesPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ResumeStudioPage } from "@/components/resume/ResumeStudioPage";
import { JobSearchPage } from "@/components/search/JobSearchPage";
import type { View } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [toast, setToast] = useState("");
  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <main className="shell">
      <Sidebar view={view} onGo={setView} />
      <section className="work">
        <Topbar />
        {view === "dashboard" && <DashboardPage onGo={setView} />}
        {view === "resume" && <ResumeStudioPage note={note} />}
        {view === "coverletter" && <CoverLetterPage note={note} />}
        {view === "search" && <JobSearchPage onGo={setView} note={note} />}
        {view === "jobs" && <JobMatchesPage onGo={setView} />}
        {view === "applications" && <ApplicationsPage note={note} />}
        {view === "interview" && <InterviewPage />}
      </section>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

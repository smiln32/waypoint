"use client";
import { useRef, useState } from "react";
import { ResumeIntake } from "@/components/resume/ResumeIntake";
import { HowItWorks } from "./HowItWorks";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";

export function StartHerePage() {
  const { note, setImportedResume } = useWaypoint();
  const onGo = useGo();
  const [importText, setImportText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadResume = (text: string, source: string) => {
    if (!text.trim()) return;
    setImportedResume(text, source);
    note(source + " loaded — opening Resume Studio");
    onGo("resume");
  };

  const uploadResume = (file?: File) => {
    if (!file) return;
    if (!/\.(txt|md|rtf)$/i.test(file.name)) {
      note("For this demo, upload a TXT, MD, or RTF resume.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => loadResume(String(reader.result ?? ""), file.name);
    reader.onerror = () => note("That file could not be read.");
    reader.readAsText(file);
  };

  return (
    <div className="page">
      <div className="heading">
        <small>START HERE</small>
        <h1>Welcome to Waypoint.</h1>
        <p>
          Add your resume first — it becomes the working draft the editors review. Then work through the
          spaces below; each one handles a single part of your transition.
        </p>
      </div>
      <ResumeIntake
        fileRef={fileRef}
        importText={importText}
        onImportTextChange={setImportText}
        onUpload={uploadResume}
        onUsePasted={() => loadResume(importText, "Pasted resume")}
      />
      <HowItWorks />
    </div>
  );
}

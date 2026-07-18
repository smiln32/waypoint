"use client";
import { useEffect, useRef, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { requestCritique } from "@/lib/critique/client";
import { findings } from "@/lib/demo-data";
import { useWaypoint } from "@/lib/store";
import type { Finding } from "@/lib/types";
import { ResumeHistoryControls } from "./ResumeHistoryControls";
import { ResumeIntake } from "./ResumeIntake";
import { ResumePaper } from "./ResumePaper";
import { ResumeReviewPanel } from "./ResumeReviewPanel";

export function ResumeStudioPage() {
  const { note } = useWaypoint();
  const [resumeFindings, setResumeFindings] = useState<Finding[]>(findings);
  const [resumeEvaluationNote, setResumeEvaluationNote] = useState(
    "Edit the resume directly, then resubmit it for evaluation.",
  );
  const [resumeImportText, setResumeImportText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const resumeRef = useRef<HTMLElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const resumeHistoryRef = useRef<string[]>([]);
  const resumeHistoryIndexRef = useRef(-1);
  const [resumeHistoryState, setResumeHistoryState] = useState({ index: -1, length: 0 });

  useEffect(() => {
    const root = resumeRef.current;
    if (!root) return;
    root.querySelectorAll("mark.resume-flag").forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent ?? "")));
    root.normalize();
    resumeFindings.forEach((finding) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const value = node.textContent ?? "";
        const start = value.indexOf(finding.quote);
        if (start >= 0) {
          const range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, start + finding.quote.length);
          const mark = document.createElement("mark");
          mark.className = "resume-flag";
          try {
            range.surroundContents(mark);
          } catch {
            // A quote that spans element boundaries can't be wrapped; skip its highlight.
          }
          break;
        }
        node = walker.nextNode();
      }
    });
  }, [resumeFindings]);

  const seedResumeHistory = () => {
    const html = resumeRef.current?.innerHTML;
    if (html !== undefined && resumeHistoryRef.current.length === 0) {
      resumeHistoryRef.current = [html];
      resumeHistoryIndexRef.current = 0;
      setResumeHistoryState({ index: 0, length: 1 });
    }
  };

  const recordResumeHistory = () => {
    const html = resumeRef.current?.innerHTML;
    if (html === undefined) return;
    if (resumeHistoryRef.current.length === 0) {
      resumeHistoryRef.current = [html];
      resumeHistoryIndexRef.current = 0;
      setResumeHistoryState({ index: 0, length: 1 });
      return;
    }
    if (resumeHistoryRef.current[resumeHistoryIndexRef.current] === html) return;
    const next = resumeHistoryRef.current.slice(0, resumeHistoryIndexRef.current + 1);
    next.push(html);
    resumeHistoryRef.current = next;
    resumeHistoryIndexRef.current = next.length - 1;
    setResumeHistoryState({ index: resumeHistoryIndexRef.current, length: next.length });
  };

  const moveResumeHistory = (direction: -1 | 1) => {
    const target = resumeHistoryIndexRef.current + direction;
    if (target < 0 || target >= resumeHistoryRef.current.length || !resumeRef.current) return;
    resumeHistoryIndexRef.current = target;
    resumeRef.current.innerHTML = resumeHistoryRef.current[target];
    setResumeHistoryState({ index: target, length: resumeHistoryRef.current.length });
    setResumeEvaluationNote("Changes not evaluated yet.");
  };

  const loadResumeText = (text: string, source: string) => {
    if (!text.trim() || !resumeRef.current) return;
    resumeRef.current.innerText = text.trim();
    const html = resumeRef.current.innerHTML;
    resumeHistoryRef.current = [html];
    resumeHistoryIndexRef.current = 0;
    setResumeHistoryState({ index: 0, length: 1 });
    setResumeFindings([]);
    setResumeEvaluationNote(source + " loaded. Resubmit it for evaluation.");
    setResumeImportText("");
    note(source + " loaded");
  };

  const uploadResume = (file?: File) => {
    if (!file) return;
    if (!/\.(txt|md|rtf)$/i.test(file.name)) {
      note("For this demo, upload a TXT, MD, or RTF resume.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      loadResumeText(text, file.name);
    };
    reader.onerror = () => note("That file could not be read.");
    reader.readAsText(file);
  };

  const evaluateResume = async () => {
    if (evaluating) return;
    const text = resumeRef.current?.innerText ?? "";
    setEvaluating(true);
    setResumeEvaluationNote("Evaluating…");
    const result = await requestCritique("resume", text);
    setResumeFindings(result.findings);
    setResumeEvaluationNote(result.note);
    setEvaluating(false);
    note(result.note);
  };

  return (
    <div className="page">
      <Heading
        kicker="RESUME STUDIO"
        title="Infantry team leader resume · Draft 1"
        text="The editor found language that a civilian reader may misunderstand."
      />
      <ResumeIntake
        fileRef={resumeFileRef}
        importText={resumeImportText}
        onImportTextChange={setResumeImportText}
        onUpload={uploadResume}
        onUsePasted={() => loadResumeText(resumeImportText, "Pasted resume")}
      />
      <div className="editor">
        <section className="resume-draft">
          <ResumeHistoryControls historyState={resumeHistoryState} onMove={moveResumeHistory} />
          <p className="resume-edit-note">Click anywhere in the resume to edit it.</p>
          <ResumePaper
            paperRef={resumeRef}
            onFocus={seedResumeHistory}
            onInput={() => {
              setResumeEvaluationNote("Changes not evaluated yet.");
              recordResumeHistory();
            }}
          />
          <div className="resume-submit">
            <span role="status">{resumeEvaluationNote}</span>
            <button className="primary" disabled={evaluating} onClick={evaluateResume}>
              Resubmit for evaluation
            </button>
          </div>
        </section>
        <ResumeReviewPanel findings={resumeFindings} />
      </div>
    </div>
  );
}

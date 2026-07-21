"use client";
import { useEffect, useRef, useState } from "react";
import { requestCritique } from "@/lib/critique/client";
import { findings, resumeDecisions } from "@/lib/demo-data";
import { extractFileText } from "@/lib/extract-text";
import { loadPersisted, persist } from "@/lib/persist";
import { RESUME_SAMPLE_ID, shouldRestoreResume } from "@/lib/resume-sample";
import { useWaypoint } from "@/lib/store";
import type { Finding } from "@/lib/types";
import { AiPrivacyNotice } from "@/components/review/AiPrivacyNotice";
import { DemoBanner } from "@/components/layout/DemoMode";

interface SavedResume {
  html: string;
  findings: Finding[];
  decisions: string[];
  note: string;
  source: "claude" | "demo" | null;
  /** Identifies which seeded sample this state derives from; absent for user uploads in live mode. */
  sampleId?: string;
}
import { ResumeHistoryControls } from "./ResumeHistoryControls";
import { ResumeIntake } from "./ResumeIntake";
import { ResumePaper } from "./ResumePaper";
import { ResumeReviewPanel } from "./ResumeReviewPanel";

export function ResumeStudioPage({ liveAiEnabled }: { liveAiEnabled: boolean }) {
  const { note } = useWaypoint();
  const [resumeImportText, setResumeImportText] = useState("");
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const [resumeFindings, setResumeFindings] = useState<Finding[]>(findings);
  const [resumeDecisionList, setResumeDecisionList] = useState<string[]>(resumeDecisions);
  const [resumeEvaluationNote, setResumeEvaluationNote] = useState(
    "Edit the resume directly, then resubmit it for evaluation.",
  );
  const [evaluating, setEvaluating] = useState(false);
  const [critiqueSource, setCritiqueSource] = useState<"claude" | "demo" | null>(null);
  const resumeRef = useRef<HTMLElement>(null);
  const resumeHistoryRef = useRef<string[]>([]);
  const resumeHistoryIndexRef = useRef(-1);
  const [resumeHistoryState, setResumeHistoryState] = useState({ index: -1, length: 0 });

  const persistResume = (partial?: Partial<SavedResume>) => {
    const html = resumeRef.current?.innerHTML;
    if (html === undefined) return;
    persist("waypoint.resume", {
      html,
      findings: resumeFindings,
      decisions: resumeDecisionList,
      note: resumeEvaluationNote,
      source: critiqueSource,
      // Tag sample-mode state with the current sample id; leave a live-mode
      // upload untagged so it is never mistaken for the seeded sample.
      sampleId: liveAiEnabled ? undefined : RESUME_SAMPLE_ID,
      ...partial,
    });
  };

  // Restore a persisted session (deferred a tick so the contentEditable ref is mounted).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!resumeRef.current) return;
      const saved = loadPersisted<SavedResume>("waypoint.resume");
      if (!shouldRestoreResume(saved, liveAiEnabled)) {
        // Stale or foreign saved résumé (older/absent sample id in sample mode):
        // keep the freshly seeded James Carter résumé and its findings/decisions,
        // and migrate any existing stored value to the current sample.
        if (saved) persistResume();
        return;
      }
      resumeRef.current.innerHTML = saved!.html;
      resumeHistoryRef.current = [saved!.html];
      resumeHistoryIndexRef.current = 0;
      setResumeHistoryState({ index: 0, length: 1 });
      setResumeFindings(saved!.findings);
      setResumeDecisionList(saved!.decisions ?? []);
      setResumeEvaluationNote(saved!.note);
      setCritiqueSource(saved!.source);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = resumeRef.current;
    if (!root) return;
    root.querySelectorAll("mark.resume-flag").forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent ?? "")));
    root.normalize();
    resumeFindings.forEach((finding, index) => {
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
          // Rendered via CSS ::after (attr) so the marker never lands in the
          // editable text that gets persisted and submitted for evaluation.
          mark.dataset.findingIndex = String(index + 1);
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
    setResumeDecisionList([]);
    setResumeEvaluationNote(source + " loaded. Resubmit it for evaluation.");
    setResumeImportText("");
    persistResume({ findings: [], decisions: [], note: source + " loaded. Resubmit it for evaluation.", source: null });
    note(source + " loaded");
  };

  const uploadResume = async (file?: File) => {
    if (!file) return;
    if (!/\.(txt|md|rtf|pdf|docx)$/i.test(file.name)) {
      note("Upload a PDF, DOCX, TXT, MD, or RTF resume.");
      return;
    }
    try {
      const text = await extractFileText(file);
      if (!text.trim()) {
        note("No readable text found in that file.");
        return;
      }
      loadResumeText(text, file.name);
    } catch {
      note("That file could not be read.");
    }
  };

  const evaluateResume = async () => {
    if (evaluating) return;
    const text = resumeRef.current?.innerText ?? "";
    setEvaluating(true);
    setResumeEvaluationNote("Evaluating…");
    const result = await requestCritique("resume", text);
    setResumeFindings(result.findings);
    setResumeDecisionList(result.decisions ?? []);
    setResumeEvaluationNote(result.note);
    setCritiqueSource(result.source);
    setEvaluating(false);
    persistResume({ findings: result.findings, decisions: result.decisions ?? [], note: result.note, source: result.source });
    note(result.note);
  };

  return (
    <div className="page">
      <DemoBanner />
      <div className="heading">
        <small>RESUME STUDIO</small>
        <h1>Resume Studio</h1>
      </div>
      <ResumeIntake
        liveAiEnabled={liveAiEnabled}
        fileRef={resumeFileRef}
        importText={resumeImportText}
        onImportTextChange={setResumeImportText}
        onUpload={uploadResume}
        onUsePasted={() => loadResumeText(resumeImportText, "Pasted resume")}
      />
      <div className="intake-heading">
        <h2>2. Review Your Resume</h2>
        <p>Submit your resume for evaluation and make edits as needed.</p>
        <p>Click anywhere in the resume to edit it.</p>
        <p>
          <a className="sample-pdf-link" href="/Waypoint_Sample_Resume_Final.pdf" target="_blank" rel="noopener noreferrer">
            View sample PDF
          </a>{" "}
          — the fictional résumé this demonstration is built around.
        </p>
      </div>
      <div className="editor">
        <section className="resume-draft">
          <ResumeHistoryControls historyState={resumeHistoryState} onMove={moveResumeHistory} />
          <ResumePaper
            paperRef={resumeRef}
            onFocus={seedResumeHistory}
            onInput={() => {
              setResumeEvaluationNote("Changes not evaluated yet.");
              recordResumeHistory();
              persistResume({ note: "Changes not evaluated yet." });
            }}
          />
          <AiPrivacyNotice liveAiEnabled={liveAiEnabled} />
          <div className="resume-submit">
            <span role="status">{resumeEvaluationNote}</span>
            <button className="primary" disabled={evaluating} onClick={evaluateResume}>
              Resubmit for evaluation
            </button>
          </div>
        </section>
      </div>
      <ResumeReviewPanel findings={resumeFindings} decisions={resumeDecisionList} source={critiqueSource} />
    </div>
  );
}

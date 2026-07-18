"use client";
import { useEffect, useRef, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { findings } from "@/lib/demo-data";
import { useWaypoint } from "@/lib/store";
import type { Finding } from "@/lib/types";
import { ResumeHistoryControls } from "./ResumeHistoryControls";
import { ResumeImport } from "./ResumeImport";
import { ResumePaper } from "./ResumePaper";
import { ResumeReviewPanel } from "./ResumeReviewPanel";

export function ResumeStudioPage() {
  const { note } = useWaypoint();
  const [selected, setSelected] = useState<number[]>([]);
  const [resumeFindings, setResumeFindings] = useState<Finding[]>(findings);
  const [resumeEvaluationNote, setResumeEvaluationNote] = useState(
    "Edit the résumé directly, then resubmit it for evaluation.",
  );
  const [resumeImportText, setResumeImportText] = useState("");
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
    setSelected([]);
    setResumeEvaluationNote(source + " loaded. Resubmit it for evaluation.");
    setResumeImportText("");
    note(source + " loaded");
  };

  const uploadResume = (file?: File) => {
    if (!file) return;
    if (!/\.(txt|md|rtf)$/i.test(file.name)) {
      note("For this demo, upload a TXT, MD, or RTF résumé.");
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

  const evaluateResume = () => {
    const text = resumeRef.current?.innerText ?? "";
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const patterns = [
      new RegExp("(^|[^A-Za-z])MC([^A-Za-z]|$)", "i"),
      new RegExp("Chief Information Security Officer", "i"),
      new RegExp("complex avionics|under time pressure", "i"),
    ];
    const next = findings.flatMap((finding, index) => {
      const quote = lines.find((line) => patterns[index].test(line));
      return quote ? [{ ...finding, quote }] : [];
    });
    setResumeFindings(next);
    setSelected([]);
    const message = next.length
      ? "Evaluation updated: " + next.length + " finding" + (next.length === 1 ? "" : "s") + " to review."
      : "Evaluation updated: no current findings from this review set.";
    setResumeEvaluationNote(message);
    note(message);
  };

  return (
    <div className="page">
      <Heading
        kicker="RESUME STUDIO"
        title="Operations resume · Draft 2"
        text="The editor found language that a civilian reader may misunderstand."
      />
      <div className="editor">
        <section className="resume-draft">
          <ResumeImport
            fileRef={resumeFileRef}
            importText={resumeImportText}
            onImportTextChange={setResumeImportText}
            onUpload={uploadResume}
            onUsePasted={() => loadResumeText(resumeImportText, "Pasted résumé")}
          />
          <ResumeHistoryControls historyState={resumeHistoryState} onMove={moveResumeHistory} />
          <p className="resume-edit-note">Click anywhere in the résumé to edit it.</p>
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
            <button className="primary" onClick={evaluateResume}>
              Resubmit for evaluation
            </button>
          </div>
        </section>
        <ResumeReviewPanel
          findings={resumeFindings}
          selected={selected}
          onToggle={(i) =>
            setSelected(selected.includes(i) ? selected.filter((n) => n !== i) : [...selected, i])
          }
          onCreateDraft={() => note(`${selected.length} decisions sent to drafting`)}
        />
      </div>
    </div>
  );
}

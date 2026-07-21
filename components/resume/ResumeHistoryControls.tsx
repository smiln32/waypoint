"use client";

export function ResumeHistoryControls({
  historyState,
  onMove,
  onDownload,
  onPrint,
}: {
  historyState: { index: number; length: number };
  onMove: (direction: -1 | 1) => void;
  onDownload: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="resume-history" aria-label="Resume edit history and export">
      <div className="resume-history-group">
        <button type="button" className="secondary" disabled={historyState.index <= 0} onClick={() => onMove(-1)}>
          Back
        </button>
        <button
          type="button"
          className="secondary"
          disabled={historyState.index < 0 || historyState.index >= historyState.length - 1}
          onClick={() => onMove(1)}
        >
          Forward
        </button>
      </div>
      <div className="resume-history-group">
        <button type="button" className="secondary" onClick={onDownload}>
          Download as text
        </button>
        <button type="button" className="secondary" onClick={onPrint}>
          Print or save as PDF
        </button>
      </div>
    </div>
  );
}

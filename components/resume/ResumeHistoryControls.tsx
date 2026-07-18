"use client";

export function ResumeHistoryControls({
  historyState,
  onMove,
}: {
  historyState: { index: number; length: number };
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="resume-history" aria-label="Resume edit history">
      <button type="button" className="secondary" disabled={historyState.index <= 0} onClick={() => onMove(-1)}>
        Undo
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
  );
}

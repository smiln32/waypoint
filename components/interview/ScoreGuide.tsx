export function ScoreGuide() {
  return (
    <div className="score-guide" aria-label="Score guide">
      <span className="guide-label">Score guide:</span>
      <span>
        <b>0</b> no evidence yet
      </span>
      <i>·</i>
      <span>
        <b>1</b> limited
      </span>
      <i>·</i>
      <span>
        <b>2</b> developing
      </span>
      <i>·</i>
      <span>
        <b>3</b> strong
      </span>
      <i>·</i>
      <span>
        <b>4</b> exceptional
      </span>
    </div>
  );
}

export function ReviewHead({ label }: { label: string }) {
  return (
    <div className="reviewhead">
      <span>
        <b>Editor pass</b>
        <small>{label}</small>
      </span>
      <em>CRITIQUE ONLY</em>
    </div>
  );
}

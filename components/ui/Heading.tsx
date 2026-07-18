export function Heading({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="heading">
      <small>{kicker}</small>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

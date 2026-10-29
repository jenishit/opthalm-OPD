export default function Avatar({
  initials,
  tone = "green",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: string;
}) {
  return <span className={`avatar ${tone} ${size}`}>{initials}</span>;
}

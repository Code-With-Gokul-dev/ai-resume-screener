// Green at 70+, amber from 40 to 69, red below 40
export function scoreTone(score) {
  if (score >= 70) return { text: "text-good", soft: "bg-good-soft", bar: "bg-good", label: "Strong match" };
  if (score >= 40) return { text: "text-warn", soft: "bg-warn-soft", bar: "bg-warn", label: "Partial match" };
  return { text: "text-bad", soft: "bg-bad-soft", bar: "bg-bad", label: "Weak match" };
}

export default function ScoreBadge({ score }) {
  const t = scoreTone(score);
  return (
    <span
      className={`inline-flex min-w-[3.25rem] justify-center rounded-full px-2.5 py-1 text-sm font-semibold ${t.soft} ${t.text}`}
      title={t.label}
    >
      {score}%
    </span>
  );
}

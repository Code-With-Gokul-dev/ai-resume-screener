"use client";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import ScoreBadge, { scoreTone } from "@/components/ScoreBadge";

function Chips({ items, tone, max = 4 }) {
  if (!items?.length) return <span className="text-xs text-slate-400">None</span>;
  const cls = tone === "good" ? "bg-good-soft text-good" : "bg-bad-soft text-bad";
  return (
    <div className="flex flex-wrap gap-1">
      {items.slice(0, max).map((s) => (
        <span key={s} className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>{s}</span>
      ))}
      {items.length > max && <span className="px-1 py-0.5 text-xs text-slate-500">+{items.length - max} more</span>}
    </div>
  );
}

function Bar({ label, weight, value }) {
  const t = scoreTone(value);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label} <span className="text-slate-500">(weight {weight})</span></span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${t.bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ResultsTable({ results, onDelete }) {
  const [open, setOpen] = useState(null);

  if (!results.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white px-4 py-10 text-center text-sm text-slate-500">
        No candidates yet. Upload resumes above and the ranking will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="border-b border-line bg-slate-50 text-slate-600">
          <tr>
            <th className="w-12 px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Matched skills</th>
            <th className="px-4 py-3 font-medium">Missing skills</th>
            <th className="w-10 px-2 py-3"><span className="sr-only">Details</span></th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const isOpen = open === r._id;
            return (
              <Fragment key={r._id}>
                <tr className="cursor-pointer border-b border-line align-top hover:bg-slate-50" onClick={() => setOpen(isOpen ? null : r._id)}>
                  <td className="px-4 py-3 font-semibold text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.candidate.name}</div>
                    <div className="text-xs text-slate-500">{r.fileName}</div>
                  </td>
                  <td className="px-4 py-3"><ScoreBadge score={r.totalScore} /></td>
                  <td className="px-4 py-3"><Chips items={r.matchedSkills} tone="good" /></td>
                  <td className="px-4 py-3"><Chips items={r.missingSkills} tone="bad" /></td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} details for ${r.candidate.name}`}
                      className="rounded p-1 text-slate-500 hover:text-ink"
                      onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : r._id); }}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>

                {isOpen && (
                  <tr className="border-b border-line bg-slate-50">
                    <td />
                    <td colSpan={5} className="px-4 py-5">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                          <h3 className="font-semibold">Score breakdown</h3>
                          <Bar label="Skills match" weight="50%" value={r.skillScore} />
                          <Bar label="Experience" weight="25%" value={r.experienceScore} />
                          <Bar label="AI fit" weight="25%" value={r.semanticScore} />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold">Summary</h3>
                            <p className="mt-1 max-w-prose leading-relaxed text-slate-700">{r.summary || "No summary available."}</p>
                          </div>
                          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                            <dt className="text-slate-500">Email</dt><dd>{r.candidate.email || "Not found"}</dd>
                            <dt className="text-slate-500">Education</dt><dd>{r.candidate.education || "Not found"}</dd>
                            <dt className="text-slate-500">Experience</dt><dd>{r.candidate.experienceYears} years</dd>
                          </dl>
                          <div>
                            <div className="mb-1 text-sm text-slate-500">Skills found in resume</div>
                            <div className="flex flex-wrap gap-1">
                              {r.candidate.skills.map((s) => (
                                <span key={s} className="rounded border border-line bg-white px-1.5 py-0.5 text-xs">{s}</span>
                              ))}
                            </div>
                          </div>
                          <button type="button" className="btn-quiet text-bad" onClick={() => onDelete(r._id)}>
                            <Trash2 className="h-4 w-4" /> Remove candidate
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

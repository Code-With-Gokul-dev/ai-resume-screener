"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import JobForm from "@/components/JobForm";

export default function Home() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/jobs");
      setJobs(data);
      setError("");
    } catch (err) {
      setError(errMsg(err));
      setJobs([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(job) {
    if (!confirm(`Delete "${job.title}" and all its results?`)) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <JobForm onCreated={load} />

      <section>
        <h2 className="text-lg font-semibold">Your jobs</h2>
        {error && <p role="alert" className="mt-3 rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

        {jobs === null && <p className="mt-3 text-sm text-slate-500">Loading jobs</p>}

        {jobs?.length === 0 && !error && (
          <p className="mt-3 rounded-lg border border-dashed border-line bg-white px-4 py-10 text-center text-sm text-slate-500">
            No jobs yet. Create your first job on the left, then upload resumes to it.
          </p>
        )}

        <ul className="mt-3 space-y-3">
          {jobs?.map((job) => (
            <li key={job._id} className="flex items-start gap-3 rounded-lg border border-line bg-white p-4">
              <Link href={`/jobs/${job._id}`} className="min-w-0 flex-1">
                <div className="font-medium hover:text-accent">{job.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {job.resumeCount} resume{job.resumeCount === 1 ? "" : "s"} analyzed
                  {job.minExperience > 0 && ` · ${job.minExperience}+ years`}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 6).map((s) => (
                    <span key={s} className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-dark">{s}</span>
                  ))}
                </div>
              </Link>
              <button type="button" onClick={() => remove(job)} aria-label={`Delete ${job.title}`} className="rounded p-1.5 text-slate-400 hover:text-bad">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

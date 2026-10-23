"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { api, API_URL, errMsg } from "@/lib/api";
import UploadBox from "@/components/UploadBox";
import ResultsTable from "@/components/ResultsTable";

export default function JobPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [results, setResults] = useState([]);
  const [failures, setFailures] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadResults = useCallback(async () => {
    const { data } = await api.get(`/results/${id}`);
    setResults(data);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const [jobRes] = await Promise.all([api.get(`/jobs/${id}`), loadResults()]);
        setJob(jobRes.data);
      } catch (err) {
        setError(errMsg(err));
      }
    })();
  }, [id, loadResults]);

  async function analyze(files) {
    setBusy(true);
    setError("");
    setFailures([]);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("resumes", f));
      const { data } = await api.post(`/resumes/${id}`, form, { timeout: 0 });
      setFailures(data.errors || []);
      await loadResults();
      return true;
    } catch (err) {
      setError(errMsg(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function removeResult(resultId) {
    try {
      await api.delete(`/results/item/${resultId}`);
      await loadResults();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  if (error && !job) {
    return (
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><ArrowLeft className="h-4 w-4" /> All jobs</Link>
        <p role="alert" className="mt-4 rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>
      </div>
    );
  }
  if (!job) return <p className="text-sm text-slate-500">Loading job</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><ArrowLeft className="h-4 w-4" /> All jobs</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {job.requiredSkills.map((s) => (
            <span key={s} className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-dark">{s}</span>
          ))}
          {job.minExperience > 0 && <span className="text-sm text-slate-500">· {job.minExperience}+ years experience</span>}
        </div>
      </div>

      <UploadBox onAnalyze={analyze} busy={busy} />

      {error && <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

      {failures.length > 0 && (
        <div role="alert" className="rounded-md bg-warn-soft px-4 py-3 text-sm text-warn">
          <p className="font-medium">{failures.length} file{failures.length > 1 ? "s" : ""} could not be analyzed</p>
          <ul className="mt-1 list-disc pl-5">
            {failures.map((f) => <li key={f.fileName}><span className="font-medium">{f.fileName}</span>: {f.error}</li>)}
          </ul>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ranked candidates ({results.length})</h2>
          {results.length > 0 && (
            <a href={`${API_URL}/export/${id}`} className="btn-quiet">
              <Download className="h-4 w-4" /> Export CSV
            </a>
          )}
        </div>
        <ResultsTable results={results} onDelete={removeResult} />
      </section>
    </div>
  );
}

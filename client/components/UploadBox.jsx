"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export default function UploadBox({ onAnalyze, busy }) {
  const [files, setFiles] = useState([]);
  const [rejected, setRejected] = useState([]);

  const onDrop = useCallback((accepted, rejections) => {
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...accepted.filter((f) => !seen.has(`${f.name}-${f.size}`))].slice(0, 20);
    });
    setRejected(rejections.map((r) => `${r.file.name}: ${r.errors[0]?.code === "file-too-large" ? "larger than 5 MB" : "not a PDF or DOCX file"}`));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: 5 * 1024 * 1024,
    disabled: busy,
  });

  const remove = (i) => setFiles(files.filter((_, idx) => idx !== i));

  async function run() {
    const ok = await onAnalyze(files);
    if (ok) setFiles([]);
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Upload resumes</h2>

      <div
        {...getRootProps()}
        className={`mt-3 flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragActive ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
        } ${busy ? "opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-accent" />
        <p className="mt-2 text-sm font-medium">{isDragActive ? "Drop the files here" : "Drag resumes here, or click to choose files"}</p>
        <p className="mt-1 text-xs text-slate-500">PDF or DOCX, up to 5 MB each, 20 files at a time</p>
      </div>

      {rejected.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">
          {rejected.map((r) => <li key={r}>{r}</li>)}
        </ul>
      )}

      {files.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-line rounded-md border border-line">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <span className="text-xs text-slate-500">{Math.max(1, Math.round(f.size / 1024))} KB</span>
                <button type="button" onClick={() => remove(i)} disabled={busy} aria-label={`Remove ${f.name}`} className="rounded p-1 text-slate-400 hover:text-bad">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="btn" onClick={run} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Analyzing" : `Analyze ${files.length} resume${files.length > 1 ? "s" : ""}`}
            </button>
            {busy && <p className="text-sm text-slate-500">Each resume takes about 5 to 10 seconds. Keep this page open.</p>}
          </div>
        </>
      )}
    </div>
  );
}

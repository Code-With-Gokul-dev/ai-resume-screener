"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";

const empty = { title: "", description: "", requiredSkills: "", minExperience: 0 };

export default function JobForm({ onCreated }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/jobs", form);
      setForm(empty);
      onCreated?.(data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Create a job</h2>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Job title</label>
        <input id="title" className="field" value={form.title} onChange={set("title")} placeholder="Full Stack Developer" required />
      </div>

      <div>
        <label htmlFor="skills" className="mb-1 block text-sm font-medium">Required skills</label>
        <input id="skills" className="field" value={form.requiredSkills} onChange={set("requiredSkills")} placeholder="React, Node.js, MongoDB, Docker" />
        <p className="mt-1 text-xs text-slate-500">Separate skills with commas. Each one is checked against every resume.</p>
      </div>

      <div>
        <label htmlFor="exp" className="mb-1 block text-sm font-medium">Minimum experience (years)</label>
        <input id="exp" type="number" min="0" max="50" step="0.5" className="field" value={form.minExperience} onChange={set("minExperience")} />
      </div>

      <div>
        <label htmlFor="desc" className="mb-1 block text-sm font-medium">Job description</label>
        <textarea id="desc" rows={7} className="field" value={form.description} onChange={set("description")} placeholder="Paste the full job description here" required />
      </div>

      {error && <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? "Creating job" : "Create job"}
      </button>
    </form>
  );
}

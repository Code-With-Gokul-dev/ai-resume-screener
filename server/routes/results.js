import { Router } from "express";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import Job from "../models/Job.js";
import Result from "../models/Result.js";

const router = Router();

const validId = (id) => mongoose.isValidObjectId(id);

router.get("/results/:jobId", async (req, res, next) => {
  try {
    if (!validId(req.params.jobId))
      return res.status(404).json({ error: "Job not found" });
    const results = await Result.find({ jobId: req.params.jobId }).sort({
      totalScore: -1,
      createdAt: 1,
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.delete("/results/item/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id))
      return res.status(404).json({ error: "Result not found" });
    await Result.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const safe = (v) => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

// CSV export
router.get("/export/:jobId", async (req, res, next) => {
  try {
    if (!validId(req.params.jobId))
      return res.status(404).json({ error: "Job not found" });

    const [job, results] = await Promise.all([
      Job.findById(req.params.jobId),
      Result.find({ jobId: req.params.jobId }).sort({ totalScore: -1 }).lean(),
    ]);

    if (!job) return res.status(404).json({ error: "Job not found" });

    const rows = results.map((r, i) => ({
      Rank: i + 1,
      Name: safe(r.candidate.name),
      Email: safe(r.candidate.email),
      Education: safe(r.candidate.education),
      "Experience (years)": r.candidate.experienceYears,
      "Total score": r.totalScore,
      "Skills score": r.skillScore,
      "Experience score": r.experienceScore,
      "AI fit score": r.semanticScore,
      "Matched skills": safe(r.matchedSkills.join(", ")),
      "Missing skills": safe(r.missingSkills.join(", ")),
      Summary: safe(r.summary),
      File: safe(r.fileName),
    }));

    const fields = rows.length ? Object.keys(rows[0]) : ["Rank", "Name", "Total score"];
    const csv = "\uFEFF" + new Parser({ fields }).parse(rows);
    const fileName = `${job.title.replace(/[^a-z0-9]+/gi, "_")}_ranking.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;

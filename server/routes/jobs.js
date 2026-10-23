import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Job from "../models/Job.js";
import Result from "../models/Result.js";

const router = Router();

const JobInput = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().min(20, "Job description must be at least 20 characters"),
  requiredSkills: z
    .union([z.string(), z.array(z.string())])
    .transform((v) =>
      (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean)
    ),
  minExperience: z.coerce.number().min(0).max(50).default(0),
});

// Create job
router.post("/", async (req, res, next) => {
  try {
    const parsed = JobInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const job = await Job.create(parsed.data);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

// List jobs (with number of analyzed resumes)
router.get("/", async (req, res, next) => {
  try {
    // Run both queries in parallel for faster response
    const [jobs, counts] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).lean(),
      Result.aggregate([{ $group: { _id: "$jobId", n: { $sum: 1 } } }]),
    ]);

    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(jobs.map((j) => ({ ...j, resumeCount: countMap[String(j._id)] || 0 })));
  } catch (err) {
    next(err);
  }
});

// Get one job
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: "Job not found" });
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// Delete job and its results
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: "Job not found" });
    // Run both deletes in parallel
    await Promise.all([
      Result.deleteMany({ jobId: req.params.id }),
      Job.findByIdAndDelete(req.params.id),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

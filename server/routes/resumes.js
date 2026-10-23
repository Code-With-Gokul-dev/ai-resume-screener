import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import Job from "../models/Job.js";
import Result from "../models/Result.js";
import extractText from "../services/extractText.js";
import { analyzeResume } from "../services/llm.js";
import score from "../services/scoring.js";

const router = Router();
const MAX_FILES = 20;
const CONCURRENCY = Number(process.env.RESUME_CONCURRENCY) || 3;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const okType =
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.(pdf|docx)$/i.test(file.originalname);
    cb(okType ? null : new Error(`${file.originalname}: only PDF and DOCX files are allowed`), okType);
  },
});


async function processFile(file, job) {
  try {
    const text = await extractText(file);
    const parsed = await analyzeResume(text, job);
    const scores = score(job, parsed, text);

    const saved = await Result.create({
      jobId: job._id,
      fileName: file.originalname,
      candidate: {
        name: parsed.name,
        email: parsed.email,
        skills: parsed.skills,
        experienceYears: parsed.experienceYears,
        education: parsed.education,
      },
      summary: parsed.summary,
      ...scores,
    });

    return { result: saved };
  } catch (err) {
    console.error(`Failed [${file.originalname}]:`, err.message);
    return { error: { fileName: file.originalname, error: err.message } };
  }
}

/**
 * @template T
 * @param {Array<() => Promise<T>>} tasks
 * @param {number} limit
 * @returns {Promise<T[]>}
 */
async function pLimit(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

router.post("/:jobId", upload.array("resumes", MAX_FILES), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId))
      return res.status(404).json({ error: "Job not found" });

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Please upload at least one PDF or DOCX file" });
    }

    const tasks = req.files.map((file) => () => processFile(file, job));
    const outcomes = await pLimit(tasks, CONCURRENCY);

    const results = outcomes.filter((o) => o.result).map((o) => o.result);
    const errors = outcomes.filter((o) => o.error).map((o) => o.error);

    res.json({ results, errors });
  } catch (err) {
    next(err);
  }
});

export default router;

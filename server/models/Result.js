import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    fileName: { type: String, required: true },
    candidate: {
      name: { type: String, default: "Unknown" },
      email: { type: String, default: "" },
      skills: { type: [String], default: [] },
      experienceYears: { type: Number, default: 0 },
      education: { type: String, default: "" },
    },
    totalScore: { type: Number, required: true, index: true },
    skillScore: Number,
    experienceScore: Number,
    semanticScore: Number,
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);

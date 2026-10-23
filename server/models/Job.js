import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    minExperience: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);

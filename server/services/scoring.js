const SYNONYMS = {
  js: "javascript",
  ts: "typescript",
  mongo: "mongodb",
  postgres: "postgresql",
  k8s: "kubernetes",
  ml: "machine learning",
  "node.js": "node",
  nodejs: "node",
  "react.js": "react",
  reactjs: "react",
  "express.js": "express",
  expressjs: "express",
  "next.js": "next",
  nextjs: "next",
  "vue.js": "vue",
  vuejs: "vue",
  tailwindcss: "tailwind",
  "tailwind css": "tailwind",
  "rest api": "rest",
  "rest apis": "rest",
  restful: "rest",
  "restful api": "rest",
  "restful apis": "rest",
};

const clean = (s) => String(s).toLowerCase().trim().replace(/\s+/g, " ");

function norm(skill) {
  const x = clean(skill);
  return SYNONYMS[x] ?? x;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function mentionedInText(skill, resumeText) {
  const re = new RegExp(`(?<![a-z0-9])${escapeRegExp(clean(skill))}(?![a-z0-9])`, "i");
  return re.test(resumeText);
}

function hasSkill(required, candidateSkillsNorm, resumeText) {
  const r = norm(required);
  const found = candidateSkillsNorm.some(
    (c) => c === r || (r.length >= 4 && c.length >= 4 && (c.includes(r) || r.includes(c)))
  );
  return (
    found ||
    mentionedInText(required, resumeText) ||
    (r !== clean(required) && mentionedInText(r, resumeText))
  );
}

/**
 * @param {object} job
 * @param {object} parsed  
 * @param {string} resumeText
 */
export default function score(job, parsed, resumeText = "") {
  const required = job.requiredSkills.filter(Boolean);
  const candidateNorm = parsed.skills.map(norm);

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of required) {
    (hasSkill(skill, candidateNorm, resumeText) ? matchedSkills : missingSkills).push(skill);
  }

  const skillScore = required.length ? (matchedSkills.length / required.length) * 100 : 100;
  const experienceScore =
    job.minExperience > 0
      ? Math.min(parsed.experienceYears / job.minExperience, 1) * 100
      : 100;
  const semanticScore = parsed.fitScore;

  const total = skillScore * 0.5 + experienceScore * 0.25 + semanticScore * 0.25;

  return {
    totalScore: Math.round(total),
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    semanticScore: Math.round(semanticScore),
    matchedSkills,
    missingSkills,
  };
}

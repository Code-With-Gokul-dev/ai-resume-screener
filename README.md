# AI Resume Screening System (MVP)

Create a job, upload PDF/DOCX resumes, and get a ranked list with scores, matched and missing skills, and an AI summary. Export the ranking as CSV.

**Stack:** Next.js (App Router) + Tailwind CSS, Node.js + Express, MongoDB (Mongoose), Gemini or Claude API.

## Requirements
- Node.js 18 or newer
- A MongoDB Atlas free cluster (or local MongoDB)
- One AI key: Gemini (free tier, https://aistudio.google.com/apikey) or Claude (https://console.anthropic.com)

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env     # then fill in MONGODB_URI and your API key
npm run dev              # http://localhost:5000
```
Optional check of the scoring logic (no database or key needed): `npm run test:scoring`

### 2. Frontend
```bash
cd client
npm install
cp .env.local.example .env.local
npm run dev              # http://localhost:3000
```

### 3. Use it
1. Open http://localhost:3000 and create a job (title, skills, minimum years, job description).
2. Open the job, drag in resumes (PDF or DOCX, 5 MB max, 20 at a time) and click Analyze.
3. Review the ranked table. Click a row for the score breakdown and summary.
4. Click Export CSV to download the ranking.

## Scoring
`Total = Skills x 0.50 + Experience x 0.25 + AI fit x 0.25`

- **Skills:** required skills found in the resume divided by total required skills. Synonyms such as JS/JavaScript and Node/Node.js are handled in `server/services/scoring.js`.
- **Experience:** candidate years divided by the minimum years (capped at 100%).
- **AI fit:** 0-100 relevance given by the LLM after reading the resume and job description.

Score colours: green 70+, amber 40-69, red below 40.

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | Get one job |
| DELETE | `/api/jobs/:id` | Delete a job and its results |
| POST | `/api/resumes/:jobId` | Upload (field `resumes`) and analyze |
| GET | `/api/results/:jobId` | Ranked results |
| DELETE | `/api/results/item/:id` | Remove one candidate |
| GET | `/api/export/:jobId` | CSV download |

## Project structure
```
server/
  index.js
  config/db.js
  models/        Job.js, Result.js
  routes/        jobs.js, resumes.js, results.js
  services/      extractText.js, llm.js, scoring.js
  middleware/    errorHandler.js
  scripts/       testScoring.js
client/
  app/           layout.js, page.js, jobs/[id]/page.js, globals.css
  components/    JobForm, UploadBox, ResultsTable, ScoreBadge
  lib/api.js
```

## Troubleshooting
- **"Cannot reach the server":** start the backend and check `NEXT_PUBLIC_API_URL` and `CLIENT_URL`.
- **MongoDB connection fails:** in Atlas, allow your IP under Network Access and check the password in `MONGODB_URI`.
- **"No readable text found":** the PDF is a scanned image. Use a text-based PDF or DOCX.
- **429 errors from Gemini:** the free tier is rate limited. Upload fewer files at once or wait a minute.
- **Switch to Claude:** set `LLM_PROVIDER=claude` and `ANTHROPIC_API_KEY` in `server/.env`.

## Deployment (optional)
Frontend on Vercel (set `NEXT_PUBLIC_API_URL`), backend on Render or Railway (set the `.env` values and `CLIENT_URL` to your Vercel URL), database on MongoDB Atlas.

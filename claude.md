# CLAUDE.md — AI Interview Simulator

## Project Context
Independent internship deliverable for PositiveWay Solutions Pvt. Ltd. (Intern Project 3).
**Deadline: Sunday.** No dependency on prior internship projects — build fresh, standalone.

---

## Tech Stack (fixed — do not substitute)
- **Frontend:** React.js + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **AI:** OpenAI API (or equivalent LLM — use Gemini API if no OpenAI key is available, same interface pattern as prior project)

---

## Objective
Build a web app that simulates real technical/HR interviews: analyzes an uploaded resume, conducts a multi-turn AI chat interview tailored to role/difficulty/resume, evaluates responses, and produces a structured performance report.

---

## User Roles

### Admin
- Secure login (JWT, role=admin)
- Dashboard: total users, total interviews conducted, avg interview score, most-selected job roles, recent interview activity
- Manage interview categories (job roles / types / difficulty — CRUD)
- View any candidate's performance reports

### Candidate
- Register/login (JWT, role=candidate)
- Profile management
- Upload resume (PDF only)
- Start new interview (role → type → difficulty)
- View past interview reports + overall performance trend
- Dashboard: profile info, resume status, interviews completed, latest score, start-interview CTA

---

## Interview Flow
1. Upload resume (PDF) → parse & store extracted text.
2. Select **Job Role** (Software Engineer / Data Scientist / AI-ML Engineer / Backend / Frontend / Full Stack Developer), **Interview Type** (Technical / HR / Mixed), **Difficulty** (Easy / Medium / Hard).
3. Chat-style interview, one question at a time. Each next question is generated using: resume content, selected role, difficulty, and the candidate's last response (context-aware follow-ups).
4. On completion → AI generates the performance report.

---

## AI Features to Implement
- **Resume parsing:** extract skills, projects, experience, education as structured text/JSON (use `pypdf`/`pdfplumber` for extraction, LLM for structuring).
- **Question generation:** system prompt combines role + difficulty + resume summary + conversation history so far.
- **Follow-up logic:** LLM decides whether to probe deeper on the last answer or move to a new topic — keep a running conversation state passed back into the prompt each turn.
- **Response evaluation:** score each answer for technical accuracy / clarity as it comes in, or batch-evaluate at the end (batch is simpler and faster to ship by Sunday — recommended).
- **Summary + feedback generation:** final LLM call over the full transcript produces scores + strengths + gaps + recommended topics.

---

## Database Schema (PostgreSQL)

```sql
-- Admins
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users (candidates)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    parsed_text TEXT,
    parsed_json JSONB,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER REFERENCES resumes(id),
    job_role VARCHAR(50) NOT NULL,
    interview_type VARCHAR(20) NOT NULL,   -- Technical / HR / Mixed
    difficulty VARCHAR(20) NOT NULL,       -- Easy / Medium / Hard
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress / completed
    transcript JSONB,                       -- [{role, question, answer, timestamp}]
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Interview Reports
CREATE TABLE interview_reports (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2),
    technical_score NUMERIC(5,2),
    communication_score NUMERIC(5,2),
    problem_solving_score NUMERIC(5,2),
    confidence_score NUMERIC(5,2),
    strengths TEXT[],
    improvements TEXT[],
    recommended_topics TEXT[],
    generated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Backend API Endpoints (FastAPI)

```
Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/admin/login

Candidate
GET    /api/profile
PUT    /api/profile
POST   /api/resume/upload
GET    /api/resume/status

Interview
POST   /api/interview/start          { job_role, interview_type, difficulty }
POST   /api/interview/{session_id}/answer   { answer_text }  -> returns next question
POST   /api/interview/{session_id}/complete
GET    /api/interview/{session_id}/report
GET    /api/interview/history

Admin
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/interviews
GET    /api/admin/interviews/{id}/report
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

---

## Suggested Folder Structure

```
ai-interview-simulator/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/          # SQLAlchemy models per table
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routes/          # auth.py, candidate.py, interview.py, admin.py
│   │   ├── services/        # resume_parser.py, ai_interviewer.py, evaluator.py
│   │   ├── core/            # config.py, security.py (JWT), db.py
│   │   └── utils/
│   ├── requirements.txt
│   └── alembic/             # migrations
├── frontend/
│   ├── src/
│   │   ├── pages/           # Login, Register, CandidateDashboard, AdminDashboard, Interview, Report
│   │   ├── components/
│   │   ├── api/             # axios client
│   │   ├── context/         # auth context
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Build Priority (to hit Sunday deadline)

**Phase 1 — Core (must-have):**
1. Auth (candidate + admin) with JWT
2. Resume upload + text extraction
3. Interview session creation + chat loop (question generation + follow-ups)
4. End-of-interview report generation
5. Candidate dashboard (basic) + Admin dashboard (basic)

**Phase 2 — Polish (if time remains):**
- Category management CRUD
- Nicer chat UI (typing indicator, progress bar per interview)
- Charts on dashboards (score trends)

**Phase 3 — Optional / stretch (explicitly out of scope for Sunday):**
Voice interview, coding round, company-specific modes, ATS score, PDF report export, multi-language.

---

## Implementation Notes
- Use one LLM system prompt template per interview turn; pass: role, difficulty, interview type, resume summary, and last 3–5 turns of transcript (not the entire history each time, to control token cost).
- Store the full transcript in `interview_sessions.transcript` (JSONB) — generate the report from this at completion in a single LLM call with a structured-JSON-output prompt (scores + strengths + improvements + topics).
- Keep resume parsing synchronous and simple for MVP (pdfplumber → raw text → one LLM call to structure it into skills/projects/experience JSON).
- Protect all `/api/admin/*` routes with an admin-role check middleware.
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `LLM_API_KEY` — never commit keys (rotate immediately via provider dashboard if ever pushed, per prior incident learnings).

---

## Deliverables Checklist
- [x] Responsive web app (candidate + admin dashboards)
- [x] Resume upload module
- [x] AI interview chat interface
- [x] AI performance report
- [x] GitHub repository (clean structure, README)
- [x] Project documentation (PRD-style, matching prior project's format)

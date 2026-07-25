# TASKS.md — Build Checklist (Sunday deadline)

Work top to bottom. Each block is roughly one focused session. Check items off as Claude Code completes them.

## 0. Scaffolding
- [x] Init backend (FastAPI) + frontend (Vite + React + Tailwind) folders per CLAUDE.md structure
- [x] `.env` from `.env.example`, install deps from `requirements.txt` / `package.json`
- [x] PostgreSQL DB created, run `schema.sql`
- [x] Basic health-check route (`GET /api/health`) wired to frontend to confirm connectivity

## 1. Auth
- [x] `users` + `admins` tables, password hashing (bcrypt/passlib)
- [x] JWT issue/verify (`core/security.py`)
- [x] Routes: register, login, admin login
- [x] Frontend: Login/Register pages, auth context, protected route wrapper

## 2. Resume Upload
- [x] `POST /api/resume/upload` — accept PDF, save to disk/storage, extract text (pdfplumber)
- [x] One LLM call to structure resume into JSON (see PROMPTS.md #1), store in `resumes.parsed_json`
- [x] Frontend: upload widget + resume status indicator

## 3. Interview Session
- [x] `POST /api/interview/start` — create session row, generate opening question (PROMPTS.md #2)
- [x] `POST /api/interview/{id}/answer` — append to transcript, generate next question
- [x] Frontend: role/type/difficulty selector screen, then chat UI (one question, one input, send)
- [x] `POST /api/interview/{id}/complete` — mark session completed, trigger report generation

## 4. Report Generation
- [x] Report generation service call (PROMPTS.md #4) → parse JSON → insert into `interview_reports`
- [x] `GET /api/interview/{id}/report`
- [x] Frontend: report view page (scores + strengths + improvements + recommended topics)

## 5. Candidate Dashboard
- [x] `GET /api/interview/history`
- [x] Frontend: profile info, resume status, interviews completed count, latest score, list of past reports, "Start Interview" CTA

## 6. Admin Dashboard
- [x] `GET /api/admin/dashboard` — aggregate counts (total users, total interviews, avg score, most-selected roles, recent activity)
- [x] `GET /api/admin/users`, `GET /api/admin/interviews`, `GET /api/admin/interviews/{id}/report`
- [x] Frontend: admin dashboard cards/table

## 7. Category Management (Phase 2 — only if time remains)
- [x] CRUD routes for interview categories
- [x] Frontend: simple admin table with add/edit/delete

## 8. Polish & Ship
- [x] Responsive check (mobile breakpoints on chat + dashboards)
- [x] Error states (upload failure, LLM timeout, empty history)
- [x] Score Trend Visualization on Dashboard
- [x] README with setup/run instructions
- [x] Push to GitHub, verify no secrets committed
- [x] Final PRD-format documentation

## Explicitly deferred (do not build unless all above is done early)
Voice interview, ATS score, PDF export, multi-language.

## Completed Extra Features
- [x] ATS Resume Match Score integration across full stack
- [x] Adaptive follow-up probing logic in AI Interviewer
- [x] Composite performance gauges on Candidate Dashboard
- [x] Coding Round (logic + UI rendering)
- [x] Company-Specific Modes (context-aware interviewing)

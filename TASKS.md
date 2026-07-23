# TASKS.md — Build Checklist (Sunday deadline)

Work top to bottom. Each block is roughly one focused session. Check items off as Claude Code completes them.

## 0. Scaffolding
- [ ] Init backend (FastAPI) + frontend (Vite + React + Tailwind) folders per CLAUDE.md structure
- [ ] `.env` from `.env.example`, install deps from `requirements.txt` / `package.json`
- [ ] PostgreSQL DB created, run `schema.sql`
- [ ] Basic health-check route (`GET /api/health`) wired to frontend to confirm connectivity

## 1. Auth
- [ ] `users` + `admins` tables, password hashing (bcrypt/passlib)
- [ ] JWT issue/verify (`core/security.py`)
- [ ] Routes: register, login, admin login
- [ ] Frontend: Login/Register pages, auth context, protected route wrapper

## 2. Resume Upload
- [ ] `POST /api/resume/upload` — accept PDF, save to disk/storage, extract text (pdfplumber)
- [ ] One LLM call to structure resume into JSON (see PROMPTS.md #1), store in `resumes.parsed_json`
- [ ] Frontend: upload widget + resume status indicator

## 3. Interview Session
- [ ] `POST /api/interview/start` — create session row, generate opening question (PROMPTS.md #2)
- [ ] `POST /api/interview/{id}/answer` — append to transcript, generate next question
- [ ] Frontend: role/type/difficulty selector screen, then chat UI (one question, one input, send)
- [ ] `POST /api/interview/{id}/complete` — mark session completed, trigger report generation

## 4. Report Generation
- [ ] Report generation service call (PROMPTS.md #4) → parse JSON → insert into `interview_reports`
- [ ] `GET /api/interview/{id}/report`
- [ ] Frontend: report view page (scores + strengths + improvements + recommended topics)

## 5. Candidate Dashboard
- [ ] `GET /api/interview/history`
- [ ] Frontend: profile info, resume status, interviews completed count, latest score, list of past reports, "Start Interview" CTA

## 6. Admin Dashboard
- [ ] `GET /api/admin/dashboard` — aggregate counts (total users, total interviews, avg score, most-selected roles, recent activity)
- [ ] `GET /api/admin/users`, `GET /api/admin/interviews`, `GET /api/admin/interviews/{id}/report`
- [ ] Frontend: admin dashboard cards/table

## 7. Category Management (Phase 2 — only if time remains)
- [ ] CRUD routes for interview categories
- [ ] Frontend: simple admin table with add/edit/delete

## 8. Polish & Ship
- [ ] Responsive check (mobile breakpoints on chat + dashboards)
- [ ] Error states (upload failure, LLM timeout, empty history)
- [x] README with setup/run instructions
- [ ] Push to GitHub, verify no secrets committed (`git diff --cached` before every commit)
- [x] Final PRD-format documentation (matching prior internship project's format)

## Explicitly deferred (do not build unless all above is done early)
Voice interview, coding round, company-specific modes, ATS score, PDF export, multi-language.

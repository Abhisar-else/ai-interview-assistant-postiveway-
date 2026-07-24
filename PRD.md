# Product Requirements Document (PRD) — AI Interview Simulator

## 1. Project Overview
The **AI Interview Simulator** is an intelligent web application designed to help candidates prepare for real-world job interviews. It leverages Generative AI to provide a realistic, adaptive, and high-gravity rehearsal environment, followed by comprehensive performance analytics.

## 2. Target Audience
* **Job Seekers:** Individuals looking to practice technical and behavioral interviews.
* **Recruitment Managers (Admins):** Individuals overseeing candidate performance and platform configuration.

## 3. Core Features & Functional Requirements

### 3.1 Candidate Experience
* **Authentication:** Secure registration and login (JWT-based).
* **Resume Grounding:** PDF resume upload with automated parsing (PDF text extraction → AI structuring).
* **Interview Orchestration:**
    * Configuration: Select job role, interview type (Technical/HR/Mixed), and difficulty level.
    * Adaptive Questioning: Multi-turn chat interface where each question is generated based on resume context, job role, and previous responses.
    * Follow-up Logic: AI probes deeper into candidate answers for technical depth.
* **Performance Reporting:**
    * Automated Scoring: Overall, Technical, Communication, Problem Solving, and Confidence scores (0-100).
    * Qualitative Feedback: Strengths, Areas for Improvement, and Recommended Study Topics.
* **Dashboard:** History of all past sessions, current resume status, and profile management.

### 3.2 Admin Experience
* **Security:** Admin-only login with restricted access to management tools.
* **Dashboard Analytics:** Aggregate metrics including total users, sessions, average scores, and popular job roles.
* **Category Management:** CRUD operations for Job Roles, Interview Types, and Difficulty Levels to populate candidate selection menus.
* **Candidate Oversight:** Ability to view all candidate interview transcripts and reports.

## 4. Technical Specifications
* **Frontend:** React.js, Vite, Tailwind CSS (Responsive Design).
* **Backend:** FastAPI (Python), SQLAlchemy (ORM), Pydantic (Validation).
* **Database:** PostgreSQL for persistent storage of users, resumes, sessions, and reports.
* **AI Integration:** OpenAI GPT-4 / Gemini Pro for resume parsing, question generation, and final evaluation.
* **Security:** JWT Authentication, Bcrypt password hashing, and restricted file access for resumes.

## 5. Success Metrics
* Successful parsing of standard PDF resumes.
* Coherent, non-repetitive AI interview dialogue.
* Generation of structured, actionable performance reports within 10 seconds of interview completion.

## 6. Timeline
* **Status:** Phase 1 (Core) and Phase 2 (Polish) completed.
* **Final Deliverable:** Sunday.

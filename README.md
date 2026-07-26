# AI Interview Simulator 🚀

An intelligent, full-stack platform designed to help candidates conquer job interviews through high-gravity AI simulations. It parses resumes, conducts adaptive multi-turn interviews tailored to specific companies and roles, and provides deep performance analytics.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Unified Project Architecture](#-unified-project-architecture)
- [Environment Variables](#-environment-variables)
- [Local Installation & Setup](#-local-installation--setup)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Security & License](#-security--license)

---

## ✨ Key Features

### 👤 For Candidates
*   **Resume Grounding:** Upload a PDF resume; AI extracts skills, projects, and experience using `pdfplumber` to personalize every question.
*   **Adaptive Chat Interface:** A realistic, turn-based interview experience where the AI probes deeper based on your previous answers.
*   **Multi-Mode Preparation:**
    *   **Technical Round:** Architecture, system design, and deep technical concepts.
    *   **Coding Round:** Hands-on algorithm and data structure challenges with monospace code rendering.
    *   **HR / Behavioral:** Culture-fit, situational questions, and career motivation.
    *   **Mixed:** A balanced blend of all interview types.
*   **Interview Focus Guard:**
    *   **Tab Switch Tracking:** Detects visibility changes (`⚠ Focus lost ×N`) if a user leaves the active interview window.
    *   **Navigation Guarding:** Soft-warns on accidental in-app sidebar clicks or window closure.
    *   **Session Resumption:** Progress auto-saves per turn; safely leave and resume anytime from the Dashboard.
*   **Voice Mode:** Integrated Web Speech API (`SpeechRecognition` dictation & `SpeechSynthesis` audio output).
*   **Performance Analytics:** Detailed radial performance reports including:
    *   **Core Metrics:** Technical Accuracy, Communication Clarity, Problem Solving Depth, and Confidence.
    *   **Qualitative Feedback:** Specific strengths, areas for improvement, and recommended study topics.
*   **Score Trends:** Visual performance tracking across completed rehearsal sessions.

### 🛡️ For Admins
*   **Management Dashboard:** High-level metrics on system usage, average performance, and popular roles.
*   **Global Audit History:** View and audit all candidate interview sessions.
*   **Category CRUD:** Manage available job roles, difficulty levels, and interview types.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Dependencies |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | React Router v6, Axios, Vanilla CSS Modules, Design Tokens (`index.css`) |
| **Backend** | FastAPI (Python 3.10+) | SQLAlchemy 2.0 (ORM), Pydantic v2, Pydantic-Settings, `pdfplumber` |
| **Database** | PostgreSQL 14+ | `psycopg2-binary` |
| **AI / LLM** | Google Gen AI SDK | `google-genai` (v2.14+) using `gemini-3.5-flash` (Supports new `AQ.` format keys) |
| **Authentication**| JWT & Password Hashing | `python-jose` (HS256), `passlib` with `bcrypt` |
| **Testing** | Automated Test Suites | Pytest (Backend, 7/7 test cases), Vitest (Frontend) |

---

## 📁 Unified Project Architecture

```text
reactfrontend/
├── ai-interview/                  # React Single-Page Application (Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/        # ScoreTrend charts & metrics
│   │   │   ├── interview/        # ChatBubble, QuestionSpotlight, ThinkingMeter
│   │   │   ├── layout/           # AppShell, ProtectedRoute
│   │   │   ├── needle/           # ConfidenceNeedle canvas visualization
│   │   │   ├── resume/           # ResumeUpload dropzone
│   │   │   └── ui/               # Badge, Button, Card, Input, Modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user auth & token management
│   │   ├── hooks/
│   │   │   ├── useInterviewGuard.js # Focus guard (tab switch & nav interception)
│   │   │   └── useVoice.js       # Speech recognition & synthesis
│   │   ├── pages/                # LoginPage, RegisterPage, DashboardPage, InterviewSetupPage, InterviewPage, ReportPage, AdminDashboardPage
│   │   ├── services/             # api.js dispatcher (Real vs Mock)
│   │   ├── index.css             # Root design system tokens
│   │   └── App.jsx               # Router & route protections
│   ├── public/                   # Static assets & icons
│   └── vite.config.js            # Vite build configuration
│
├── backend/                       # FastAPI Server (Backend)
│   ├── app/
│   │   ├── main.py               # FastAPI initialization & middleware
│   │   ├── core/                 # Config (pydantic-settings), DB session, Security
│   │   ├── models/               # SQLAlchemy models (User, Admin, Resume, Session, Report, Category)
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic (ai_interviewer, evaluator, llm, resume_parser)
│   │   └── routes/               # Routes (auth, candidate, interview, categories, admin)
│   ├── migrations/               # SQL database migration scripts
│   ├── tests/                    # Pytest test suite (7/7 tests passing)
│   └── requirements.txt          # Python dependencies
│
├── schema.sql                     # PostgreSQL Base Schema
├── PRD.md                        # Product Requirements Document
└── TASKS.md                       # Implementation status & task roadmap
```

---

## ⚙️ Environment Variables

### 1. Backend (`backend/.env`)
```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/interview_simulator
JWT_SECRET=32_byte_super_secure_random_hex_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
GEMINI_API_KEY=AQ.Ab8RN6...  # Google AI Studio API Key (AQ. or AIza format)
GEMINI_MODEL=gemini-3.5-flash
FRONTEND_ORIGIN=http://localhost:5173
```

### 2. Frontend (`ai-interview/.env`)
```ini
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **PostgreSQL**: 14+

### 2. Database Initialization
```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE interview_simulator;"

# Initialize schema
psql -U postgres -d interview_simulator -f schema.sql
```

#### Idempotent Schema Migration (for existing databases)
If your database was created before `session_id` became unique on `interview_reports`:
```bash
psql "$DATABASE_URL" -f backend/migrations/20260726_add_interview_report_session_unique.sql
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

### 4. Frontend Setup
```bash
cd ai-interview

# Install npm packages
npm install

# Create .env from template
cp .env.example .env
```

---

## 🏃 Running the Application

**Start Backend API Server (Terminal 1):**
```bash
cd backend
python -m uvicorn app.main:app --reload
```
*API interactive documentation available at: `http://localhost:8000/docs`*

**Start Frontend Development Server (Terminal 2):**
```bash
cd ai-interview
npm run dev
```
*Web Application live at: `http://localhost:5173`*

---

## 🧪 Testing

### Backend Test Suite (Pytest)
```bash
cd backend
pytest
```
*Runs all 7 test suites covering auth flow, admin access, interview completion, database migrations, and fallback question variety.*

### Frontend Production Build Verification
```bash
cd ai-interview
npx vite build
```

---

## 📝 Security & Offline Support

- **Offline / Key Fallback**: If no LLM API key is configured, the backend gracefully switches to a rotating, context-aware question pool tailored by job role and category.
- **Security**: JWT authentication, bcrypt password hashing, and parameterized database queries prevent SQL injection and unauthorized access.

---
*Built as an independent internship project for PositiveWay Solutions Pvt. Ltd.*

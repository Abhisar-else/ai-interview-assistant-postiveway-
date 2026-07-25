# AI Interview Simulator 🚀

An intelligent, full-stack platform designed to help candidates conquer job interviews through high-gravity AI simulations. It parses resumes, conducts adaptive multi-turn interviews tailored to specific companies and roles, and provides deep performance analytics.

---

## ✨ Key Features

### 👤 For Candidates
*   **Resume Grounding:** Upload a PDF resume; AI extracts skills, projects, and experience to personalize every question.
*   **Adaptive Chat Interface:** A realistic, turn-based interview experience where the AI probes deeper based on your previous answers.
*   **Multi-Mode Preparation:**
    *   **Technical Round:** Concepts, system design, and architecture.
    *   **Coding Round:** Hands-on algorithm and data structure challenges with monospace code rendering.
    *   **HR / Behavioral:** Culture-fit, motivation, and situational questions.
    *   **Mixed:** A balanced blend of all the above.
*   **Company-Specific Training:** Configure simulations for specific targets like Google, Amazon, or local startups.
*   **Performance Analytics:** Detailed reports including:
    *   **ATS Resume Match:** Real-time feedback on how your resume aligns with the target role.
    *   **Core Metrics:** Technical Accuracy, Communication Clarity, Problem Solving Depth, and Confidence.
    *   **Qualitative Feedback:** Specific strengths, areas for improvement, and recommended study topics.
*   **Score Trends:** Track your progress over time with visual performance charts on your dashboard.
*   **Profile Management:** Manage your contact details and identity securely.

### 🛡️ For Admins
*   **Management Dashboard:** High-level metrics on system usage, average performance, and popular roles.
*   **Global History:** View and audit every interview session conducted on the platform.
*   **Detailed Report Viewer:** Access the full AI-generated performance report for any candidate session.
*   **Category CRUD:** Manage the available job roles, difficulty levels, and interview types available to candidates.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Headless UI |
| **Backend** | FastAPI (Python 3.10+), SQLAlchemy (ORM) |
| **Database** | PostgreSQL |
| **AI** | Google Gemini API (or OpenAI GPT-4o) |
| **Testing** | Vitest (Frontend), Pytest (Backend) |

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   PostgreSQL 14+

### 2. Database Initialization
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE interview_simulator;"

# Run the schema
psql -U postgres -d interview_simulator -f schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and DATABASE_URL
```

### 4. Frontend Setup
```bash
cd ai-interview
npm install

# Configure Environment
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

---

## 🏃 Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
uvicorn app.main:app --reload
```

**Start Frontend (Terminal 2):**
```bash
cd ai-interview
npm run dev
```
The app will be live at `http://localhost:5173`.

---

## 🧪 Testing

This project follows strict TDD principles and includes comprehensive test suites.

**Frontend Tests:**
```bash
cd ai-interview
npm test
```

**Backend Tests:**
```bash
cd backend
pytest
```

---

## 📁 Project Structure

```text
├── ai-interview/          # React Frontend (Vite + Tailwind)
│   ├── src/               # UI components, pages, context, and API services
│   ├── tests/             # Vitest test suites
│   └── vite.config.js     # Testing and build configuration
├── backend/               # FastAPI Backend
│   ├── app/               # Core logic (routes, models, services, schemas)
│   ├── tests/             # Pytest backend suites
│   └── requirements.txt   # Python dependency manifest
├── schema.sql             # PostgreSQL Database Schema
├── PRD.md                # Full Product Requirements Document
└── TASKS.md               # Implementation roadmap and status
```

---

## 📝 Usage Notes
*   **Admin Access:** Insert your first admin user via the provided Python utility or SQL query tool to access management features.
*   **Security:** This project utilizes JWT authentication and encodes sensitive database credentials for maximum safety.

---
*Built as an independent internship project for PositiveWay Solutions Pvt. Ltd.*

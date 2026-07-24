# AI Interview Simulator

AI Interview Simulator is a full-stack web application designed to simulate real technical and HR interviews. It analyzes uploaded resumes, conducts multi-turn AI chat interviews tailored to the candidate's role and difficulty level, evaluates responses, and produces a structured performance report.

This project was built as an independent internship deliverable for PositiveWay Solutions Pvt. Ltd.

## 🚀 Features

### For Candidates
* **Resume Parsing:** Upload your PDF resume, and the AI will extract your skills, projects, experience, and education.
* **Customizable Interviews:** Choose your Job Role (Software Engineer, Data Scientist, etc.), Interview Type (Technical, HR, Mixed), and Difficulty (Easy, Medium, Hard).
* **Context-Aware AI Chat:** The AI generates questions dynamically based on your resume, selected role, difficulty, and your previous answers. It can ask follow-up questions to probe deeper into your responses.
* **Performance Reports:** Receive a detailed evaluation after completing the interview, including scores (overall, technical, communication, problem-solving, confidence), identified strengths, areas for improvement, and recommended topics to study.
* **Dashboard:** Track your profile info, resume status, completed interviews, and past reports.

### For Admins
* **Secure Dashboard:** View total users, total interviews conducted, average interview scores, most-selected job roles, and recent interview activity.
* **Category Management:** Manage interview categories (Job Roles, Interview Types, Difficulty levels).
* **Candidate Oversight:** View the performance reports of any candidate.

## 🛠️ Tech Stack

* **Frontend:** React.js + Vite + Tailwind CSS
* **Backend:** FastAPI (Python)
* **Database:** PostgreSQL
* **AI Integration:** OpenAI API (or Google Gemini API)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:

* **Node.js** (v18+ recommended) and `npm`
* **Python** (v3.10+ recommended)
* **PostgreSQL**

## 💻 Local Installation & Setup

Follow these steps to run the application on your localhost.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-interview-simulator
```

### 2. Database Setup

Ensure your PostgreSQL server is running. Create a new database named `interview_simulator` and run the provided SQL schema to create the necessary tables.

```bash
# Log into your PostgreSQL instance
psql -U your_postgres_user

# Inside psql shell
CREATE DATABASE interview_simulator;
\q

# Run the schema script
psql -U your_postgres_user -d interview_simulator -f schema.sql
```

### 3. Backend Setup

Open a terminal and navigate to the `backend` directory.

```bash
cd backend
```

Create a virtual environment and activate it:

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

#### Environment Variables (Backend)

Create a `.env` file in the `backend` directory (you can use the provided `env.example (1).txt` as a reference):

```bash
cp "env.example (1).txt" .env
```

Edit the `.env` file and fill in your details:

```env
# Database Connection (update user/password as needed)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/interview_simulator

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# LLM Provider Configuration (Provide ONE of these)
OPENAI_API_KEY=your_openai_api_key
# GEMINI_API_KEY=your_gemini_api_key

# File Storage
RESUME_UPLOAD_DIR=./uploads/resumes

# Frontend Origin for CORS
FRONTEND_ORIGIN=http://localhost:5173
```

*Note: Ensure the `uploads/resumes` directory exists or the backend is configured to create it automatically.*

Start the FastAPI server:

```bash
cd app
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### 4. Frontend Setup

Open a **new** terminal and navigate to the `ai-interview` directory (Frontend).

```bash
cd ai-interview
```

Install the Node.js dependencies:

```bash
npm install
```

#### Environment Variables (Frontend)

If required, create a `.env` file in the `ai-interview` directory to set the backend API URL (Vite uses `VITE_` prefix):

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:

```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
.
├── ai-interview/          # React Frontend (Vite + Tailwind)
│   ├── src/               # React components, pages, context, services
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
├── backend/               # FastAPI Backend
│   ├── app/               # Core application code (routes, models, schemas, services)
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Backend environment variables
├── schema.sql             # PostgreSQL Database Schema
├── PRD.md                # Product Requirements Document
├── PROMPTS.md             # LLM Prompt Templates used for the AI logic
├── TASKS.md               # Build checklist and project tracking
└── CLAUDE.md              # Project specifications and architecture
```

## 📝 Usage Notes

* **Admin Access:** To log in as an Admin, you will need to manually insert an admin record into the `admins` table in your PostgreSQL database, ensuring the password is hashed correctly according to your backend implementation.
* **LLM Costs:** Please monitor your OpenAI/Gemini API usage as generating multi-turn interviews and comprehensive reports consumes tokens.

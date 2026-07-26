-- AI Interview Simulator — PostgreSQL Schema
-- Run this after creating the database: psql -d interview_simulator -f schema.sql

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    parsed_text TEXT,
    parsed_json JSONB,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE interview_categories (
    id SERIAL PRIMARY KEY,
    job_role VARCHAR(50) NOT NULL,
     target_company VARCHAR(100),
    interview_type VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER REFERENCES resumes(id),
    job_role VARCHAR(50) NOT NULL,
    target_company VARCHAR(100),
    interview_type VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    transcript JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE interview_reports (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2),
    ats_score NUMERIC(5,2),               -- ADD THIS LINE
    technical_score NUMERIC(5,2),
    communication_score NUMERIC(5,2),
    problem_solving_score NUMERIC(5,2),
    confidence_score NUMERIC(5,2),
    strengths TEXT[],
    improvements TEXT[],
    recommended_topics TEXT[],
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_sessions_status ON interview_sessions(status);
CREATE INDEX idx_reports_session ON interview_reports(session_id);

-- Seed default categories
INSERT INTO interview_categories (job_role, interview_type, difficulty) VALUES
('Software Engineer', 'Technical', 'Easy'),
('Software Engineer', 'Technical', 'Medium'),
('Software Engineer', 'Technical', 'Hard'),
('Data Scientist', 'Technical', 'Medium'),
('AI/ML Engineer', 'Technical', 'Medium'),
('Backend Developer', 'Technical', 'Medium'),
('Frontend Developer', 'Technical', 'Medium'),
('Full Stack Developer', 'Mixed', 'Medium');

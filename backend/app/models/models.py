from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(Text, nullable=False)
    parsed_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    sessions = relationship("InterviewSession", back_populates="resume")

class InterviewCategory(Base):
    __tablename__ = "interview_categories"

    id = Column(Integer, primary_key=True, index=True)
    job_role = Column(String(50), nullable=False)
    interview_type = Column(String(20), nullable=False)
    difficulty = Column(String(20), nullable=False)
    active = Column(Boolean, default=True)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_role = Column(String(50), nullable=False)
    interview_type = Column(String(20), nullable=False)
    difficulty = Column(String(20), nullable=False)
    status = Column(String(20), default="in_progress", index=True)
    transcript = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
    resume = relationship("Resume", back_populates="sessions")
    report = relationship("InterviewReport", back_populates="session", uselist=False, cascade="all, delete-orphan")

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Numeric(5, 2), nullable=True)
    ats_score = Column(Numeric(5, 2), nullable=True)
    technical_score = Column(Numeric(5, 2), nullable=True)
    communication_score = Column(Numeric(5, 2), nullable=True)
    problem_solving_score = Column(Numeric(5, 2), nullable=True)
    confidence_score = Column(Numeric(5, 2), nullable=True)
    strengths = Column(JSON, nullable=True)         # JSON list of strings
    improvements = Column(JSON, nullable=True)      # JSON list of strings
    recommended_topics = Column(JSON, nullable=True)# JSON list of strings
    generated_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="report")

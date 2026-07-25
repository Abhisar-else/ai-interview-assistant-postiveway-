from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

# --- Resume ---
class ResumeOut(BaseModel):
    id: int
    user_id: int
    file_path: str
    parsed_json: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Interview ---
class InterviewStart(BaseModel):
    job_role: str
    target_company: Optional[str] = None
    interview_type: str
    difficulty: str

class AnswerSubmit(BaseModel):
    answer: str

class AnswerResponse(BaseModel):
    question: str

class SessionOut(BaseModel):
    id: int
    user_id: int
    job_role: str
    target_company: Optional[str] = None
    interview_type: str
    difficulty: str
    status: str
    transcript: Optional[List[Dict[str, Any]]] = None
    overall_score: Optional[float] = None
    ats_score: Optional[float] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Report ---
class ReportOut(BaseModel):
    id: int
    session_id: int
    overall_score: float
    ats_score: float
    technical_score: float
    communication_score: float
    problem_solving_score: float
    confidence_score: float
    strengths: List[str]
    improvements: List[str]
    recommended_topics: List[str]
    generated_at: datetime

    class Config:
        from_attributes = True

# --- Categories ---
class CategoryCreate(BaseModel):
    job_role: str
    target_company: Optional[str] = None
    interview_type: str
    difficulty: str

class CategoryUpdate(BaseModel):
    job_role: Optional[str] = None
    target_company: Optional[str] = None
    interview_type: Optional[str] = None
    difficulty: Optional[str] = None
    active: Optional[bool] = None

class CategoryOut(BaseModel):
    id: int
    job_role: str
    target_company: Optional[str] = None
    interview_type: str
    difficulty: str
    active: bool

    class Config:
        from_attributes = True

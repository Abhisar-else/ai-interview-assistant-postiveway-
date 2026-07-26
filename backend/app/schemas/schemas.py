from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=20)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

# --- Resume ---
class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    file_path: str
    parsed_json: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

# --- Interview ---
class InterviewStart(BaseModel):
    job_role: str = Field(..., min_length=2, max_length=50)
    target_company: Optional[str] = Field(None, max_length=100)
    interview_type: str = Field(..., pattern="^(Technical|HR|Mixed|Coding)$")
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")

class AnswerSubmit(BaseModel):
    answer: str = Field(..., min_length=1, max_length=5000)

class AnswerResponse(BaseModel):
    question: str

class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

# --- Report ---
class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

# --- Categories ---
class CategoryCreate(BaseModel):
    job_role: str = Field(..., min_length=2, max_length=50)
    target_company: Optional[str] = Field(None, max_length=100)
    interview_type: str = Field(..., pattern="^(Technical|HR|Mixed|Coding)$")
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")

class CategoryUpdate(BaseModel):
    job_role: Optional[str] = Field(None, min_length=2, max_length=50)
    target_company: Optional[str] = Field(None, max_length=100)
    interview_type: Optional[str] = Field(None, pattern="^(Technical|HR|Mixed|Coding)$")
    difficulty: Optional[str] = Field(None, pattern="^(Easy|Medium|Hard)$")
    active: Optional[bool] = None

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_role: str
    target_company: Optional[str] = None
    interview_type: str
    difficulty: str
    active: bool

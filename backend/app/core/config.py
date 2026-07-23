import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Simulator API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interview_simulator.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ai_interview_simulator_secret_key_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    RESUME_UPLOAD_DIR: str = os.getenv("RESUME_UPLOAD_DIR", "./uploads/resumes")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

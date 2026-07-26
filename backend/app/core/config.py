import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "AI Interview Simulator API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interview_simulator.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Model Selection (Defaults to high-speed versions)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

    RESUME_UPLOAD_DIR: str = os.getenv("RESUME_UPLOAD_DIR", "./uploads/resumes")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

settings = Settings()

if not settings.JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not set. Add it to backend/.env (see .env.example) — "
        "generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

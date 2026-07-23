import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

# Handle SQLite vs PostgreSQL connection args
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
except Exception as e:
    # Fallback to local SQLite if PostgreSQL fails connection
    print(f"Warning: Database connection to {db_url} failed ({e}). Falling back to SQLite.")
    db_url = "sqlite:///./interview_simulator.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

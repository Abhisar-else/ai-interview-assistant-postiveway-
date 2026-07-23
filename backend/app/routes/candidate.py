import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Resume
from app.schemas.schemas import ResumeOut
from app.services.resume_parser import parse_resume

router = APIRouter(prefix="", tags=["Candidate & Resume"])

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format files are supported.")

    os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.RESUME_UPLOAD_DIR, f"user_{current_user['id']}_{file.filename}")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Parse text & JSON using pdfplumber + LLM
    raw_text, parsed_json = parse_resume(file_path)

    # Delete existing resume for user if any
    db.query(Resume).filter(Resume.user_id == current_user["id"]).delete()

    new_resume = Resume(
        user_id=current_user["id"],
        file_path=file_path,
        parsed_text=raw_text,
        parsed_json=parsed_json
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "id": new_resume.id,
        "user_id": new_resume.user_id,
        "file_path": new_resume.file_path,
        "parsed_json": new_resume.parsed_json,
        "uploaded_at": new_resume.uploaded_at
    }

@router.get("/resume")
def get_user_resume(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user["id"]).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "file_path": resume.file_path,
        "parsed_json": resume.parsed_json,
        "uploaded_at": resume.uploaded_at
    }

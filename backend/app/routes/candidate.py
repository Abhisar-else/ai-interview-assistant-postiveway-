import os
import uuid
import logging
import bleach
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Resume, User
from app.schemas.schemas import ResumeOut, UserOut, ProfileUpdate
from app.services.resume_parser import parse_resume

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="", tags=["Candidate & Resume"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def sanitize_parsed_json(data: dict) -> dict:
    """Helper to clean all strings in the parsed resume JSON."""
    if isinstance(data, dict):
        return {k: sanitize_parsed_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_parsed_json(v) for v in data]
    elif isinstance(data, str):
        return bleach.clean(data, tags=[], strip=True)
    return data

@router.get("/profile", response_model=UserOut)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile", response_model=UserOut)
def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        # Sanitize input to prevent Stored XSS
        user.name = bleach.clean(data.name, tags=[], strip=True)
    if data.phone is not None:
        user.phone = bleach.clean(data.phone, tags=[], strip=True)

    db.commit()
    db.refresh(user)
    return user

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Size Validation (DoS Prevention)
    # Seek to end to get size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (Max 10MB)")

    # 2. Content Type / Magic Number Validation
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format files are supported.")

    header = await file.read(4)
    await file.seek(0)
    if header != b'%PDF':
        raise HTTPException(status_code=400, detail="Invalid PDF content")

    try:
        os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)
        safe_filename = f"user_{current_user['id']}_{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(settings.RESUME_UPLOAD_DIR, safe_filename)

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        raw_text, parsed_json = parse_resume(file_path)

        # Sanitize LLM output to prevent XSS in Admin views
        parsed_json = sanitize_parsed_json(parsed_json)

        # STRICT VALIDATION: Reject if no interview-relevant info is found
        skills = parsed_json.get("skills", [])
        experience = parsed_json.get("experience", [])
        projects = parsed_json.get("projects", [])

        if not skills or (not experience and not projects):
            # Clean up the file
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail="Resume Rejected: No interview-relevant information (skills, experience, or projects) detected in PDF."
            )

        # ATOMIC SAVE: Record new resume before deleting old one
        new_resume = Resume(
            user_id=current_user["id"],
            file_path=file_path,
            parsed_text=raw_text,
            parsed_json=parsed_json
        )

        # Delete existing resume for user if any
        db.query(Resume).filter(Resume.user_id == current_user["id"]).delete()

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
    except Exception as e:
        logger.error(f"Critical upload failure for user {current_user['id']}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing your resume. Please try again or contact support."
        )

@router.get("/resume")
@router.get("/resume/status")
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

@router.get("/resume/file")
def get_resume_file(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Serves the candidate's own resume PDF. Replaces the old public
    /uploads static mount — ownership is checked here instead of relying
    on an unguessable filename."""
    resume = db.query(Resume).filter(Resume.user_id == current_user["id"]).first()
    if not resume or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="No resume file found")
    return FileResponse(
        resume.file_path,
        media_type="application/pdf",
        filename=os.path.basename(resume.file_path),
    )

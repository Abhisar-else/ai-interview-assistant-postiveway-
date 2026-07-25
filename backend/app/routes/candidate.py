import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Resume, User
from app.schemas.schemas import ResumeOut, UserOut, ProfileUpdate

router = APIRouter(prefix="", tags=["Candidate & Resume"])

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

    if data.name:
        user.name = data.name
    if data.phone:
        user.phone = data.phone

    db.commit()
    db.refresh(user)
    return user

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format files are supported.")

    os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)
    # Server-generated filename — never build paths from client-supplied
    # file.filename (a crafted "../../" filename can escape RESUME_UPLOAD_DIR).
    safe_filename = f"user_{current_user['id']}_{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(settings.RESUME_UPLOAD_DIR, safe_filename)

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

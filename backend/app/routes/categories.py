from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.core.security import get_current_admin
from app.models.models import InterviewCategory
from app.schemas.schemas import CategoryOut, CategoryCreate, CategoryUpdate

router = APIRouter(tags=["Categories"])

@router.get("/categories", response_model=List[CategoryOut])
def get_public_categories(db: Session = Depends(get_db)):
    categories = db.query(InterviewCategory).filter(InterviewCategory.active == True).all()
    if not categories:
        # Seed defaults if empty
        defaults = [
            ("Software Engineer", "Technical", "Easy"),
            ("Software Engineer", "Technical", "Medium"),
            ("Software Engineer", "Technical", "Hard"),
            ("Data Scientist", "Technical", "Medium"),
            ("AI/ML Engineer", "Technical", "Medium"),
            ("Backend Developer", "Technical", "Medium"),
            ("Frontend Developer", "Technical", "Medium"),
            ("Full Stack Developer", "Mixed", "Medium"),
        ]
        for role, itype, diff in defaults:
            c = InterviewCategory(job_role=role, target_company=None, interview_type=itype, difficulty=diff, active=True)
            db.add(c)
        db.commit()
        categories = db.query(InterviewCategory).all()
    return categories

@router.get("/admin/categories", response_model=List[CategoryOut])
def get_admin_categories(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(InterviewCategory).all()

@router.post("/admin/categories", response_model=CategoryOut)
def create_category(
    data: CategoryCreate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = InterviewCategory(
        job_role=data.job_role,
        target_company=data.target_company,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        active=True
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/admin/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(InterviewCategory).filter(InterviewCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if data.job_role is not None:
        cat.job_role = data.job_role
    if data.target_company is not None:
        cat.target_company = data.target_company
    if data.interview_type is not None:
        cat.interview_type = data.interview_type
    if data.difficulty is not None:
        cat.difficulty = data.difficulty
    if data.active is not None:
        cat.active = data.active

    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(InterviewCategory).filter(InterviewCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}

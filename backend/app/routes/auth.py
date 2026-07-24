from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.models import User, Admin
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register_candidate(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        phone=user_data.phone,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": "candidate"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "role": "candidate"}
    }


@router.post("/login", response_model=TokenResponse)
def login_candidate(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "role": "candidate"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": "candidate"}
    }

@router.post("/admin/login", response_model=TokenResponse)
def login_admin(credentials: UserLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()

    # Seed default admin if table is empty on first login attempt
    if not admin and credentials.email == "admin@interviewsim.ai":
        admin = Admin(
            name="Admin",
            email="admin@interviewsim.ai",
            password_hash=get_password_hash("password")
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_access_token({"sub": admin.id, "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": admin.id, "name": admin.name, "email": admin.email, "role": "admin"}
    }

user_router = APIRouter(prefix="/user", tags=["User"])

@user_router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

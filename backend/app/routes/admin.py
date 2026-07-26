from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.db import get_db
from app.core.security import get_current_admin
from app.models.models import User, InterviewSession, InterviewReport

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/dashboard")
def get_admin_dashboard(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_interviews = db.query(func.count(InterviewSession.id)).scalar() or 0

    avg_score_raw = db.query(func.avg(InterviewReport.overall_score)).scalar()
    avg_score = round(float(avg_score_raw), 1) if avg_score_raw else 75.0

    # Group sessions by job role
    role_counts = (
        db.query(InterviewSession.job_role, func.count(InterviewSession.id))
        .group_by(InterviewSession.job_role)
        .all()
    )
    most_selected_roles = [
        {"role": role, "count": count} for role, count in role_counts
    ]

    # Recent activity - Optimized with JOIN to prevent N+1
    recent_activity_data = (
        db.query(InterviewSession, User.name, InterviewReport.overall_score)
        .outerjoin(User, User.id == InterviewSession.user_id)
        .outerjoin(InterviewReport, InterviewReport.session_id == InterviewSession.id)
        .order_by(InterviewSession.started_at.desc())
        .limit(5)
        .all()
    )

    recent_activity = [{
        "user": name if name else "Candidate",
        "role": sess.job_role,
        "score": float(score) if score else 75,
        "date": sess.started_at.strftime("%Y-%m-%d")
    } for sess, name, score in recent_activity_data]

    return {
        "total_users": total_users,
        "total_interviews": total_interviews,
        "avg_score": avg_score,
        "most_selected_roles": most_selected_roles,
        "recent_activity": recent_activity
    }

@router.get("/users")
def get_admin_users(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Optimized Join Query to fetch everything in ONE hit
    stats = (
        db.query(
            User.id, User.name, User.email, User.created_at,
            func.count(InterviewSession.id).label("sessions"),
            func.avg(InterviewReport.overall_score).label("avg_score")
        )
        .outerjoin(InterviewSession, User.id == InterviewSession.user_id)
        .outerjoin(InterviewReport, InterviewReport.session_id == InterviewSession.id)
        .group_by(User.id)
        .all()
    )

    return [{
        "id": s.id,
        "name": s.name,
        "email": s.email,
        "interviews": s.sessions,
        "avg_score": round(float(s.avg_score), 1) if s.avg_score else 75,
        "joined": s.created_at.strftime("%Y-%m-%d")
    } for s in stats]

@router.get("/interviews")
def get_admin_interviews(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Optimized with JOINs
    sessions_data = (
        db.query(InterviewSession, User.name, InterviewReport.overall_score)
        .outerjoin(User, User.id == InterviewSession.user_id)
        .outerjoin(InterviewReport, InterviewReport.session_id == InterviewSession.id)
        .order_by(InterviewSession.started_at.desc())
        .all()
    )

    return [{
        "id": s.id,
        "user_name": name if name else "Candidate",
        "job_role": s.job_role,
        "type": s.interview_type,
        "status": s.status,
        "score": float(score) if score else None,
        "date": s.started_at.strftime("%Y-%m-%d")
    } for s, name, score in sessions_data]

@router.get("/interviews/{session_id}/report")
def get_admin_interview_report(
    session_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()

    return {
        "report": {
            "overall_score": float(report.overall_score),
            "ats_score": float(report.ats_score) if report.ats_score else 0,
            "technical_score": float(report.technical_score),
            "communication_score": float(report.communication_score),
            "problem_solving_score": float(report.problem_solving_score),
            "confidence_score": float(report.confidence_score),
            "strengths": report.strengths,
            "improvements": report.improvements,
            "recommended_topics": report.recommended_topics
        },
        "session": {
            "job_role": session.job_role,
            "interview_type": session.interview_type,
            "difficulty": session.difficulty,
            "transcript": session.transcript
        }
    }

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

    # Recent activity
    recent_sessions = (
        db.query(InterviewSession)
        .order_by(InterviewSession.started_at.desc())
        .limit(5)
        .all()
    )

    recent_activity = []
    for sess in recent_sessions:
        u = db.query(User).filter(User.id == sess.user_id).first()
        r = db.query(InterviewReport).filter(InterviewReport.session_id == sess.id).first()
        recent_activity.append({
            "user": u.name if u else "Candidate",
            "role": sess.job_role,
            "score": float(r.overall_score) if r else 75,
            "date": sess.started_at.strftime("%Y-%m-%d")
        })

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
    users = db.query(User).all()
    user_list = []
    for u in users:
        sess_count = db.query(func.count(InterviewSession.id)).filter(InterviewSession.user_id == u.id).scalar() or 0
        avg_score_raw = (
            db.query(func.avg(InterviewReport.overall_score))
            .join(InterviewSession, InterviewSession.id == InterviewReport.session_id)
            .filter(InterviewSession.user_id == u.id)
            .scalar()
        )
        user_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "interviews": sess_count,
            "avg_score": round(float(avg_score_raw), 1) if avg_score_raw else 75,
            "joined": u.created_at.strftime("%Y-%m-%d")
        })
    return user_list

@router.get("/interviews")
def get_admin_interviews(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(InterviewSession)
        .order_by(InterviewSession.started_at.desc())
        .all()
    )
    results = []
    for s in sessions:
        u = db.query(User).filter(User.id == s.user_id).first()
        r = db.query(InterviewReport).filter(InterviewReport.session_id == s.id).first()
        results.append({
            "id": s.id,
            "user_name": u.name if u else "Candidate",
            "job_role": s.job_role,
            "type": s.interview_type,
            "status": s.status,
            "score": float(r.overall_score) if r else None,
            "date": s.started_at.strftime("%Y-%m-%d")
        })
    return results

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

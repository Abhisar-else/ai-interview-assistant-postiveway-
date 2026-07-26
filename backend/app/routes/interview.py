from datetime import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.dialects.postgresql import insert
from app.core.db import get_db
from app.core.security import get_current_user
from app.models.models import InterviewSession, InterviewReport, Resume
from app.schemas.schemas import InterviewStart, AnswerSubmit, AnswerResponse
from app.services.ai_interviewer import generate_next_question
from app.services.evaluator import generate_performance_report

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start")
def start_interview_session(
    data: InterviewStart,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user["id"]).first()
    resume_summary = resume.parsed_json if resume else {}

    # Generate opening question
    try:
        opening_q = generate_next_question(
            job_role=data.job_role,
            interview_type=data.interview_type,
            difficulty=data.difficulty,
            resume_summary=resume_summary,
            transcript=[],
            is_first_turn=True,
            target_company=data.target_company
        )
    except Exception as e:
        logger.error(f"Opening question generation failed: {type(e).__name__}")
        opening_q = "Thank you for joining. To start, could you introduce yourself and walk me through your background?"

    initial_transcript = [{"role": "ai", "content": opening_q}]

    session = InterviewSession(
        user_id=current_user["id"],
        resume_id=resume.id if resume else None,
        job_role=data.job_role,
        target_company=data.target_company,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        status="in_progress",
        transcript=initial_transcript,
        started_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "job_role": session.job_role,
        "target_company": session.target_company,
        "interview_type": session.interview_type,
        "difficulty": session.difficulty,
        "status": session.status,
        "transcript": session.transcript,
        "started_at": session.started_at
    }

@router.post("/{session_id}/answer", response_model=AnswerResponse)
def submit_answer(
    session_id: int,
    data: AnswerSubmit,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Lock the row for update to prevent race conditions during transcript updates
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).with_for_update().first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Interview session is already completed")

    transcript = list(session.transcript) if session.transcript else []
    # Append user answer and COMMIT immediately to prevent data loss during slow AI call
    transcript.append({"role": "user", "content": data.answer})
    session.transcript = transcript
    flag_modified(session, "transcript")
    db.commit()

    # Fetch resume summary
    resume = db.query(Resume).filter(Resume.id == session.resume_id).first() if session.resume_id else None
    resume_summary = resume.parsed_json if resume else {}

    # Generate adaptive follow-up question (Slow external call)
    try:
        next_q = generate_next_question(
            job_role=session.job_role,
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            resume_summary=resume_summary,
            transcript=transcript,
            is_first_turn=False,
            target_company=session.target_company
        )
    except Exception as e:
        logger.error(f"AI Question Generation failed: {type(e).__name__}")
        # Fallback question if AI fails, so the interview can continue
        next_q = "That's an interesting point. Can you elaborate more on that, or should we move to the next topic?"

    # Re-fetch/lock to append AI response
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).with_for_update().first()
    transcript = list(session.transcript)
    transcript.append({"role": "ai", "content": next_q})

    # Update transcript with AI response
    session.transcript = transcript
    flag_modified(session, "transcript")
    db.commit()

    return {"question": next_q}

@router.post("/{session_id}/complete")
def complete_interview_session(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = "completed"
    session.completed_at = datetime.utcnow()

    # Fetch resume summary
    resume = db.query(Resume).filter(Resume.id == session.resume_id).first() if session.resume_id else None
    resume_summary = resume.parsed_json if resume else {}

    # Generate final AI report
    report_dict = generate_performance_report(
        job_role=session.job_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        transcript=session.transcript or [],
        resume_summary=resume_summary,
        target_company=session.target_company
    )

    # Atomic UPSERT to interview_reports table
    stmt = insert(InterviewReport).values(
        session_id=session.id,
        overall_score=report_dict.get("overall_score", 75),
        ats_score=report_dict.get("ats_score", 70),
        technical_score=report_dict.get("technical_score", 75),
        communication_score=report_dict.get("communication_score", 75),
        problem_solving_score=report_dict.get("problem_solving_score", 75),
        confidence_score=report_dict.get("confidence_score", 75),
        strengths=report_dict.get("strengths", []),
        improvements=report_dict.get("improvements", []),
        recommended_topics=report_dict.get("recommended_topics", []),
        generated_at=datetime.utcnow()
    ).on_conflict_do_nothing(index_elements=['session_id'])

    db.execute(stmt)
    db.commit()

    # Fetch the report (whether newly created or existing)
    report = db.query(InterviewReport).filter(InterviewReport.session_id == session.id).first()

    return {
        "id": report.id,
        "session_id": report.session_id,
        "overall_score": float(report.overall_score),
        "ats_score": float(report.ats_score) if report.ats_score else 0,
        "technical_score": float(report.technical_score),
        "communication_score": float(report.communication_score),
        "problem_solving_score": float(report.problem_solving_score),
        "confidence_score": float(report.confidence_score),
        "strengths": report.strengths,
        "improvements": report.improvements,
        "recommended_topics": report.recommended_topics,
        "generated_at": report.generated_at
    }

@router.get("/history")
def get_interview_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user["id"]
    ).order_by(InterviewSession.started_at.desc()).all()
    result = []
    for s in sessions:
        report = db.query(InterviewReport).filter(InterviewReport.session_id == s.id).first()
        result.append({
            "id": s.id,
            "job_role": s.job_role,
            "interview_type": s.interview_type,
            "difficulty": s.difficulty,
            "status": s.status,
            "transcript": s.transcript,
            "started_at": s.started_at,
            "completed_at": s.completed_at,
            "overall_score": float(report.overall_score) if report else None,
            "ats_score": float(report.ats_score) if report and report.ats_score else None,
        })
    return result

@router.get("/{session_id}")
def get_session_by_id(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session

@router.get("/{session_id}/report")
def get_session_report(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not generated for this session yet")

    return {
        "id": report.id,
        "session_id": report.session_id,
        "overall_score": float(report.overall_score),
        "ats_score": float(report.ats_score) if report.ats_score else 0,
        "technical_score": float(report.technical_score),
        "communication_score": float(report.communication_score),
        "problem_solving_score": float(report.problem_solving_score),
        "confidence_score": float(report.confidence_score),
        "strengths": report.strengths,
        "improvements": report.improvements,
        "recommended_topics": report.recommended_topics,
        "generated_at": report.generated_at
    }

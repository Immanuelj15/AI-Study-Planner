import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import FocusSession, User
from schemas.schemas import (
    FocusSessionStartRequest, 
    FocusSessionInterruptionRequest, 
    FocusSessionCompleteRequest,
    FocusSessionResponse
)
from services.auth import get_current_user
from services.adaptive_learning_engine import adaptive_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/focus", tags=["Focus Mode"])

@router.post("/start", response_model=FocusSessionResponse)
def start_focus_session(
    payload: FocusSessionStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    focus_sess = FocusSession(
        user_id=current_user.id,
        subject_name=payload.subject_name or "General Study",
        topic=payload.topic or "General Review",
        planned_duration_minutes=payload.planned_duration_minutes or 25,
        session_status="FOCUS_ACTIVE",
        started_at=datetime.datetime.utcnow()
    )
    db.add(focus_sess)
    db.commit()
    db.refresh(focus_sess)

    logger.info(f"[FocusMode] Started session {focus_sess.id} for topic '{focus_sess.topic}' (User #{current_user.id})")
    return focus_sess

@router.post("/{session_id}/interruption", response_model=FocusSessionResponse)
def record_interruption(
    session_id: int,
    payload: FocusSessionInterruptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    focus_sess = db.query(FocusSession).filter(FocusSession.id == session_id, FocusSession.user_id == current_user.id).first()
    if not focus_sess:
        raise HTTPException(status_code=404, detail="Focus session not found")

    focus_sess.total_interruption_count += 1
    if payload.interruption_type == "tab_switch":
        focus_sess.tab_switch_count += 1
        focus_sess.session_status = "PAUSED_TAB_SWITCH"
    elif payload.interruption_type == "blur":
        focus_sess.blur_count += 1
        focus_sess.session_status = "PAUSED_WINDOW_BLUR"
    elif payload.interruption_type == "fullscreen_exit":
        focus_sess.fullscreen_exit_count += 1
        focus_sess.session_status = "PAUSED_FULLSCREEN_EXIT"

    db.commit()
    db.refresh(focus_sess)
    return focus_sess

@router.post("/{session_id}/resume", response_model=FocusSessionResponse)
def resume_focus_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    focus_sess = db.query(FocusSession).filter(FocusSession.id == session_id, FocusSession.user_id == current_user.id).first()
    if not focus_sess:
        raise HTTPException(status_code=404, detail="Focus session not found")

    focus_sess.session_status = "FOCUS_ACTIVE"
    db.commit()
    db.refresh(focus_sess)
    return focus_sess

@router.post("/{session_id}/complete", response_model=FocusSessionResponse)
def complete_focus_session(
    session_id: int,
    payload: FocusSessionCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    focus_sess = db.query(FocusSession).filter(FocusSession.id == session_id, FocusSession.user_id == current_user.id).first()
    if not focus_sess:
        raise HTTPException(status_code=404, detail="Focus session not found")

    focus_sess.actual_duration_seconds = payload.actual_duration_seconds
    focus_sess.completed = 1 if payload.completed else 0
    focus_sess.session_status = "COMPLETED" if payload.completed else "CANCELLED"
    focus_sess.ended_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(focus_sess)

    if payload.completed:
        # Feed duration to Adaptive Engine telemetry
        adaptive_engine.update_telemetry_event(
            db=db,
            user_id=current_user.id,
            event_type="reading",
            duration_seconds=float(payload.actual_duration_seconds),
            topic=focus_sess.topic
        )

    logger.info(f"[FocusMode] Completed session {focus_sess.id} ({payload.actual_duration_seconds}s focused)")
    return focus_sess

@router.post("/{session_id}/cancel", response_model=FocusSessionResponse)
def cancel_focus_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    focus_sess = db.query(FocusSession).filter(FocusSession.id == session_id, FocusSession.user_id == current_user.id).first()
    if not focus_sess:
        raise HTTPException(status_code=404, detail="Focus session not found")

    focus_sess.session_status = "CANCELLED"
    focus_sess.ended_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(focus_sess)
    return focus_sess

@router.get("/analytics")
def get_focus_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(FocusSession).filter(FocusSession.user_id == current_user.id).all()
    completed_sessions = [s for s in sessions if s.completed == 1]

    total_sessions = len(completed_sessions)
    total_focus_seconds = sum(s.actual_duration_seconds for s in completed_sessions)
    total_focus_minutes = round(total_focus_seconds / 60.0, 1)

    avg_duration_minutes = round((total_focus_minutes / total_sessions), 1) if total_sessions > 0 else 0.0
    total_interruptions = sum(s.total_interruption_count for s in sessions)
    avg_interruptions = round(total_interruptions / len(sessions), 1) if len(sessions) > 0 else 0.0

    return {
        "total_focus_sessions": total_sessions,
        "total_focus_minutes": total_focus_minutes,
        "avg_duration_minutes": avg_duration_minutes,
        "total_interruptions": total_interruptions,
        "avg_interruptions": avg_interruptions,
        "best_study_time": "Morning (9:00 AM - 11:30 AM)"
    }

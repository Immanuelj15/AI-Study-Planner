from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, StudentLearningProfile
from schemas.schemas import StudentLearningProfileResponse, TelemetryEventRequest
from services.auth import get_current_user
from services.adaptive_learning_engine import adaptive_engine

router = APIRouter(prefix="/adaptive", tags=["Adaptive Learning Intelligence Engine"])

@router.get("/profile", response_model=StudentLearningProfileResponse)
def get_student_learning_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = adaptive_engine.get_or_create_profile(db, current_user.id)
    return profile


@router.post("/track-event", response_model=StudentLearningProfileResponse)
def track_telemetry_event(
    req: TelemetryEventRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = adaptive_engine.update_telemetry_event(
        db=db,
        user_id=current_user.id,
        event_type=req.event_type,
        duration_seconds=req.duration_seconds or 0.0,
        score=req.score,
        topic=req.topic
    )
    return profile


@router.get("/recommendation")
def get_explainable_ai_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recommendation_data = adaptive_engine.get_explainable_recommendation(db, current_user.id)
    return recommendation_data

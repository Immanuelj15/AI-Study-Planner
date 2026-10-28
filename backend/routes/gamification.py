from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User
from services.auth import get_current_user
from services.gamification_service import gamification_service

router = APIRouter(prefix="/gamification", tags=["Learning Streaks & Gamification"])

@router.get("/overview")
def get_gamification_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve active daily streaks, longest streak, XP points, student level, and unlocked achievement badges."""
    return gamification_service.get_student_gamification_overview(db, current_user)

@router.post("/record-activity")
def record_activity(
    activity_type: str = "study",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record learning activity (quiz, study session, revision) to update streak and XP."""
    award = 30 if activity_type == "quiz" else 20
    return gamification_service.record_learning_activity(db, current_user, activity_type, award)

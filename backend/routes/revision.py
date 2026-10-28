from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from database.session import get_db
from models.models import User
from services.auth import get_current_user
from services.spaced_repetition_service import spaced_repetition_service

router = APIRouter(prefix="/revision", tags=["Smart Revision & Spaced Repetition"])

class ReviewActionRequest(BaseModel):
    schedule_id: int
    success: bool # True if recalled, False if struggled

@router.get("/schedule")
def get_revision_schedule(
    subject: Optional[str] = Query(None, description="Optional subject filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve categorized revision items: Due Today, Upcoming, and Overdue."""
    return spaced_repetition_service.get_student_revision_schedule(db, current_user, subject)

@router.post("/review")
def review_topic(
    req: ReviewActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit recall feedback to advance or reset the spaced repetition interval."""
    res = spaced_repetition_service.review_topic(db, req.schedule_id, current_user.id, req.success)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/flashcards")
def get_flashcards(
    topic: str = Query(..., description="Topic name"),
    subject: str = Query(..., description="Subject name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch high-yield flashcards for a specific topic."""
    cards = spaced_repetition_service.get_flashcards(db, current_user, topic, subject)
    return {"topic": topic, "subject": subject, "flashcards": cards}

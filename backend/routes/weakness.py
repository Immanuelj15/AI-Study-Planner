from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from database.session import get_db
from models.models import User
from services.auth import get_current_user
from services.weakness_analyzer import weakness_analyzer
from pydantic import BaseModel

router = APIRouter(prefix="/weakness", tags=["AI Weakness Detection & Personalized Learning"])

class RecordMasteryRequest(BaseModel):
    subject_name: str
    topic_name: str
    score: float
    is_correct: Optional[bool] = True

@router.get("/analysis")
def get_weakness_analysis(
    subject: Optional[str] = Query(None, description="Optional subject filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve topic-level weakness analysis and categorized topics."""
    return weakness_analyzer.analyze_student_weaknesses(db, current_user, subject)

@router.get("/recommendations")
def get_recommendations(
    topic: str = Query(..., description="Target topic"),
    subject: str = Query(..., description="Target subject"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch actionable recommendations (notes, flashcards, tutor sessions) for a topic."""
    return weakness_analyzer.get_personalized_recommendations(db, current_user, topic, subject)

@router.post("/record-mastery")
def record_mastery(
    req: RecordMasteryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record quiz/topic assessment result to update mastery tracking."""
    result = weakness_analyzer.record_topic_mastery(
        db=db,
        user=current_user,
        subject_name=req.subject_name,
        topic_name=req.topic_name,
        score=req.score,
        is_correct=req.is_correct if req.is_correct is not None else True
    )
    return {
        "status": "success",
        "topic": result.topic_name,
        "mastery_score": result.mastery_score,
        "classification": result.status
    }

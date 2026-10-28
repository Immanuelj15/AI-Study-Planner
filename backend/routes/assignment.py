from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from database.session import get_db
from models.models import User, AssignmentSubmission
from services.auth import get_current_user
from services.assignment_evaluator import assignment_evaluator

router = APIRouter(prefix="/assignments", tags=["AI Assignment Evaluator"])

class AssignmentSubmitRequest(BaseModel):
    subject_name: str
    assignment_title: str
    question_prompt: str
    student_answer: str
    unit_number: Optional[int] = 1
    rubric: Optional[str] = None

@router.post("/evaluate")
def evaluate_assignment(
    req: AssignmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit an assignment answer for instant AI conceptual review, rubric feedback, and practice score."""
    if len(req.student_answer.strip()) < 10:
        raise HTTPException(status_code=400, detail="Student answer is too short to evaluate.")

    return assignment_evaluator.evaluate_submission(
        db=db,
        user=current_user,
        subject_name=req.subject_name,
        assignment_title=req.assignment_title,
        question_prompt=req.question_prompt,
        student_answer=req.student_answer,
        unit_number=req.unit_number or 1,
        rubric=req.rubric
    )

@router.get("/history")
def get_assignment_history(
    subject: Optional[str] = Query(None, description="Optional subject filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve past assignment practice submissions and feedback."""
    query = db.query(AssignmentSubmission).filter(AssignmentSubmission.user_id == current_user.id)
    if subject:
        query = query.filter(AssignmentSubmission.subject_name.ilike(f"%{subject}%"))
    subs = query.order_by(AssignmentSubmission.submitted_at.desc()).all()

    return [
        {
            "id": s.id,
            "subject_name": s.subject_name,
            "assignment_title": s.assignment_title,
            "question_prompt": s.question_prompt,
            "student_answer": s.student_answer,
            "estimated_score": s.estimated_score,
            "conceptual_correctness": s.conceptual_correctness,
            "key_points_covered": s.key_points_covered,
            "missing_concepts": s.missing_concepts,
            "clarity_feedback": s.clarity_feedback,
            "suggested_improvements": s.suggested_improvements,
            "submitted_at": s.submitted_at.strftime("%Y-%m-%d %H:%M")
        }
        for s in subs
    ]

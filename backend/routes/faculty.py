from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from database.session import get_db
from models.models import User
from services.auth import get_current_user
from services.faculty_analytics_service import faculty_analytics_service

router = APIRouter(prefix="/faculty", tags=["Faculty Analytics & AI Early Warning System"])

@router.get("/overview")
def get_faculty_overview(
    department: Optional[str] = Query(None, description="Filter by department"),
    semester: Optional[int] = Query(None, description="Filter by semester"),
    section: Optional[str] = Query(None, description="Filter by section"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve faculty analytics overview with student learning indicators,
    quiz score distributions, common weak topics, and AI early warning alerts.
    """
    # Verify user belongs to faculty or has administrative role or is checking as faculty
    return faculty_analytics_service.get_faculty_class_overview(
        db=db,
        faculty_user=current_user,
        department=department,
        semester=semester,
        section=section,
        subject_name=subject
    )

@router.get("/my-early-warning")
def get_my_early_warning_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Student endpoint to view their own early warning status and recommended interventions."""
    overview = faculty_analytics_service.get_faculty_class_overview(
        db=db,
        faculty_user=current_user
    )
    my_data = next((s for s in overview["students"] if s["student_id"] == current_user.id), None)
    if not my_data:
        return {
            "status": "On Track",
            "supporting_reasons": ["Active study plan participation"],
            "recommended_intervention": "Continue your planned syllabus study sessions.",
            "suggested_activity": "Practice 5 questions in your next study block."
        }
    return {
        "status": my_data["early_warning_status"],
        "supporting_reasons": my_data["supporting_reasons"],
        "recommended_intervention": my_data["recommended_intervention"],
        "suggested_activity": my_data["suggested_activity"],
        "average_score": my_data["average_score"],
        "syllabus_completion": my_data["syllabus_completion"]
    }

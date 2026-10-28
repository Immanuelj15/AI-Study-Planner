from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from database.session import get_db
from models.models import User, ExamPrepPlan
from services.auth import get_current_user
from services.exam_prep_service import exam_prep_service

router = APIRouter(prefix="/exam-prep", tags=["Exam Preparation Mode"])

class ExamPlanCreateRequest(BaseModel):
    subject_name: str
    exam_date: str # YYYY-MM-DD
    available_hours_per_day: float = 3.0
    preparation_level: Optional[str] = "Intermediate"
    preferred_study_time: Optional[str] = "Morning (9:00 AM - 12:00 PM)"

class TaskUpdateRequest(BaseModel):
    status: Optional[str] = None # Completed, Pending, Rescheduled

@router.post("/plan")
def create_exam_plan(
    req: ExamPlanCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a realistic, day-by-day exam preparation schedule from syllabus units."""
    plan_data = exam_prep_service.create_exam_plan(
        db=db,
        user=current_user,
        subject_name=req.subject_name,
        exam_date_str=req.exam_date,
        available_hours_per_day=req.available_hours_per_day,
        preparation_level=req.preparation_level or "Intermediate",
        preferred_study_time=req.preferred_study_time or "Morning (9:00 AM - 12:00 PM)"
    )
    return plan_data

@router.get("/plans")
def list_exam_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active exam preparation plans for the student."""
    plans = db.query(ExamPrepPlan).filter(ExamPrepPlan.user_id == current_user.id).order_by(ExamPrepPlan.exam_date.asc()).all()
    results = []
    for p in plans:
        details = exam_prep_service.get_plan_details(db, p.id, current_user.id)
        if details:
            results.append(details)
    return results

@router.get("/plan/{plan_id}")
def get_exam_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch complete details, tasks, and countdown metrics for a specific plan."""
    plan_data = exam_prep_service.get_plan_details(db, plan_id, current_user.id)
    if not plan_data:
        raise HTTPException(status_code=404, detail="Exam plan not found")
    return plan_data

@router.patch("/task/{task_id}")
def toggle_task(
    task_id: int,
    req: Optional[TaskUpdateRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle task completion or mark rescheduled."""
    status = req.status if req else None
    res = exam_prep_service.toggle_task(db, task_id, current_user.id, status)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.delete("/plan/{plan_id}")
def delete_exam_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an exam plan."""
    plan = db.query(ExamPrepPlan).filter(ExamPrepPlan.id == plan_id, ExamPrepPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Exam plan not found")
    db.delete(plan)
    db.commit()
    return {"status": "deleted", "plan_id": plan_id}

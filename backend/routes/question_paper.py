import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from database.session import get_db
from models.models import User, QuestionPaper
from services.auth import get_current_user
from services.question_paper_service import question_paper_service

router = APIRouter(prefix="/question-papers", tags=["Previous Question Paper Analyzer"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "question_papers")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_question_paper(
    file: UploadFile = File(...),
    subject_name: str = Form(...),
    subject_code: Optional[str] = Form(""),
    academic_year: Optional[str] = Form("2024-2025"),
    semester: Optional[int] = Form(3),
    regulation: Optional[str] = Form("R2021"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and analyze a university previous question paper (PDF, DOCX, TXT)."""
    allowed_exts = [".pdf", ".docx", ".txt"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")

    file_save_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    analysis_res = question_paper_service.process_and_analyze_paper(
        db=db,
        user=current_user,
        file_path=file_save_path,
        filename=file.filename,
        subject_name=subject_name,
        subject_code=subject_code,
        academic_year=academic_year,
        semester=semester,
        regulation=regulation
    )
    return analysis_res

@router.get("")
def list_question_papers(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List uploaded question papers for the student's college."""
    query = db.query(QuestionPaper).filter(QuestionPaper.college_id == current_user.college_id)
    if subject:
        query = query.filter(QuestionPaper.subject_name.ilike(f"%{subject}%"))
    papers = query.order_by(QuestionPaper.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "subject_name": p.subject_name,
            "subject_code": p.subject_code,
            "filename": p.filename,
            "academic_year": p.academic_year,
            "semester": p.semester,
            "regulation": p.regulation,
            "created_at": p.created_at.strftime("%Y-%m-%d")
        }
        for p in papers
    ]

@router.get("/{paper_id}")
def get_paper_details(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch extracted questions, marks, unit distribution, and frequency metrics."""
    data = question_paper_service.get_paper_analysis(db, paper_id, current_user.college_id)
    if not data:
        raise HTTPException(status_code=404, detail="Question paper not found")
    return data

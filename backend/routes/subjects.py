from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.session import get_db
from models.models import User, Subject
from schemas.schemas import SubjectCreate, SubjectResponse
from services.auth import get_current_user

router = APIRouter(tags=["Subjects"])

@router.post("/subjects", response_model=SubjectResponse)
def create_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Subject).filter(
        Subject.user_id == current_user.id,
        Subject.subject_name == subject_in.subject_name
    ).first()
    
    if existing:
        return existing

    subject = Subject(
        user_id=current_user.id,
        subject_name=subject_in.subject_name,
        difficulty=subject_in.difficulty or "Medium"
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Subject).filter(Subject.user_id == current_user.id).all()

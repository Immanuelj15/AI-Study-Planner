from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from database.session import get_db
from models.models import User, StudyGroup, StudyGroupMember, StudyGroupSession
from services.auth import get_current_user

router = APIRouter(prefix="/study-groups", tags=["Peer Study Groups"])

class StudyGroupCreateRequest(BaseModel):
    name: str
    subject_name: str
    department: Optional[str] = "Computer Science"
    semester: Optional[int] = 3
    description: Optional[str] = None

class StudyGroupSessionRequest(BaseModel):
    topic: str
    scheduled_date: str # YYYY-MM-DD
    scheduled_time: str # e.g. "4:00 PM - 5:30 PM"
    goal: Optional[str] = None

@router.post("")
def create_study_group(
    req: StudyGroupCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new peer study group for the student's college and subject."""
    group = StudyGroup(
        name=req.name,
        college_id=current_user.college_id,
        department=req.department or current_user.department,
        subject_name=req.subject_name,
        semester=req.semester or current_user.semester,
        description=req.description,
        created_by=current_user.id
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    # Automatically add creator as Admin member
    member = StudyGroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="Admin"
    )
    db.add(member)
    db.commit()

    return {
        "id": group.id,
        "name": group.name,
        "subject_name": group.subject_name,
        "department": group.department,
        "semester": group.semester,
        "member_count": 1,
        "role": "Admin"
    }

@router.get("")
def search_study_groups(
    subject: Optional[str] = Query(None, description="Search by subject"),
    department: Optional[str] = Query(None, description="Filter by department"),
    semester: Optional[int] = Query(None, description="Filter by semester"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List and search study groups belonging to student's college."""
    query = db.query(StudyGroup).filter(StudyGroup.college_id == current_user.college_id)
    if subject:
        query = query.filter(StudyGroup.subject_name.ilike(f"%{subject}%"))
    if department:
        query = query.filter(StudyGroup.department.ilike(f"%{department}%"))
    if semester:
        query = query.filter(StudyGroup.semester == semester)

    groups = query.order_by(StudyGroup.created_at.desc()).all()

    results = []
    for g in groups:
        members = db.query(StudyGroupMember).filter(StudyGroupMember.group_id == g.id).all()
        is_member = any(m.user_id == current_user.id for m in members)
        my_role = next((m.role for m in members if m.user_id == current_user.id), None)
        
        # Next scheduled session
        next_session = db.query(StudyGroupSession).filter(
            StudyGroupSession.group_id == g.id,
            StudyGroupSession.status == "Scheduled"
        ).order_by(StudyGroupSession.scheduled_date.asc()).first()

        results.append({
            "id": g.id,
            "name": g.name,
            "subject_name": g.subject_name,
            "department": g.department,
            "semester": g.semester,
            "description": g.description,
            "member_count": len(members),
            "is_member": is_member,
            "user_role": my_role,
            "next_session": {
                "topic": next_session.topic,
                "scheduled_date": next_session.scheduled_date,
                "scheduled_time": next_session.scheduled_time
            } if next_session else None
        })

    return results

@router.post("/{group_id}/join")
def join_study_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join an active peer study group."""
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id, StudyGroup.college_id == current_user.college_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Study group not found")

    existing = db.query(StudyGroupMember).filter(
        StudyGroupMember.group_id == group_id,
        StudyGroupMember.user_id == current_user.id
    ).first()
    if existing:
        return {"status": "already_member", "role": existing.role}

    member = StudyGroupMember(
        group_id=group_id,
        user_id=current_user.id,
        role="Member"
    )
    db.add(member)
    db.commit()

    return {"status": "joined", "group_id": group_id, "role": "Member"}

@router.get("/{group_id}")
def get_study_group_details(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View members, scheduled sessions, and shared goals for a study group."""
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id, StudyGroup.college_id == current_user.college_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Study group not found")

    members = db.query(StudyGroupMember).filter(StudyGroupMember.group_id == group_id).all()
    sessions = db.query(StudyGroupSession).filter(StudyGroupSession.group_id == group_id).order_by(StudyGroupSession.scheduled_date.asc()).all()

    member_list = []
    for m in members:
        u = db.query(User).filter(User.id == m.user_id).first()
        member_list.append({
            "user_id": m.user_id,
            "name": u.name if u else "Peer Student",
            "role": m.role,
            "joined_at": m.joined_at.strftime("%Y-%m-%d")
        })

    session_list = [
        {
            "id": s.id,
            "topic": s.topic,
            "scheduled_date": s.scheduled_date,
            "scheduled_time": s.scheduled_time,
            "goal": s.goal,
            "status": s.status
        }
        for s in sessions
    ]

    return {
        "id": group.id,
        "name": group.name,
        "subject_name": group.subject_name,
        "department": group.department,
        "semester": group.semester,
        "description": group.description,
        "members": member_list,
        "sessions": session_list
    }

@router.post("/{group_id}/sessions")
def schedule_study_session(
    group_id: int,
    req: StudyGroupSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a collaborative group study session."""
    membership = db.query(StudyGroupMember).filter(
        StudyGroupMember.group_id == group_id,
        StudyGroupMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You must be a member of this study group to schedule sessions.")

    session_obj = StudyGroupSession(
        group_id=group_id,
        topic=req.topic,
        scheduled_date=req.scheduled_date,
        scheduled_time=req.scheduled_time,
        goal=req.goal,
        status="Scheduled"
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)

    return {
        "id": session_obj.id,
        "topic": session_obj.topic,
        "scheduled_date": session_obj.scheduled_date,
        "scheduled_time": session_obj.scheduled_time,
        "goal": session_obj.goal,
        "status": session_obj.status
    }

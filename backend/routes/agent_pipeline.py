import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.session import get_db
from models.models import User, Subject, StudyPlan, Summary, Quiz
from schemas.schemas import (
    ResearchRequest, ResearchOutput,
    SummarizeRequest, SummaryResponse,
    QuizGenerationRequest, QuizItem,
    PlanGenerationRequest, StudyPlanResponse
)
from services.auth import get_current_user
from agents.autogen_manager import autogen_manager

router = APIRouter(tags=["Multi-Agent Pipeline"])

@router.post("/research", response_model=ResearchOutput)
def execute_research(
    req: ResearchRequest,
    current_user: User = Depends(get_current_user)
):
    result = autogen_manager.research_agent.execute(req.topic)
    return result


@router.post("/summarize", response_model=SummaryResponse)
def execute_summarize(
    req: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch research if not provided
    research_content = req.research_content
    if not research_content:
        research_content = autogen_manager.research_agent.execute(req.topic)

    summary_data = autogen_manager.summarizer_agent.execute(research_content)
    
    # Save to database
    summary_obj = Summary(
        subject_id=req.subject_id,
        topic=req.topic,
        summary=summary_data.get("summary", ""),
        bullet_points=json.dumps(summary_data.get("bullet_points", [])),
        mindmap_json=json.dumps(summary_data.get("mindmap_json", {}))
    )
    db.add(summary_obj)
    db.commit()
    db.refresh(summary_obj)

    return {
        "id": summary_obj.id,
        "subject_id": req.subject_id,
        "topic": req.topic,
        "summary": summary_data.get("summary", ""),
        "bullet_points": summary_data.get("bullet_points", []),
        "mindmap_json": summary_data.get("mindmap_json", {})
    }


@router.post("/generate-mindmap")
def generate_mindmap(
    req: ResearchRequest,
    current_user: User = Depends(get_current_user)
):
    research_data = autogen_manager.research_agent.execute(req.topic)
    summary_data = autogen_manager.summarizer_agent.execute(research_data)
    return {
        "topic": req.topic,
        "mindmap_json": summary_data.get("mindmap_json", {})
    }


@router.post("/generate-quiz", response_model=List[QuizItem])
def generate_quiz(
    req: QuizGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = autogen_manager.quiz_agent.execute(
        topic=req.topic,
        summary_text=req.summary_text or "",
        difficulty=req.difficulty or "Medium",
        num_questions=req.num_questions or 5
    )

    saved_quizzes = []
    for q in questions:
        quiz_obj = Quiz(
            subject_id=req.subject_id,
            topic=req.topic,
            question=q.get("question", ""),
            options=json.dumps(q.get("options", [])),
            answer=q.get("answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", "Medium")
        )
        db.add(quiz_obj)
        db.commit()
        db.refresh(quiz_obj)
        
        q["id"] = quiz_obj.id
        saved_quizzes.append(q)

    return saved_quizzes


@router.post("/generate-plan", response_model=List[StudyPlanResponse])
def generate_study_plan(
    req: PlanGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user subjects or create missing ones
    subject_objs = []
    for sub_name in req.subjects:
        existing = db.query(Subject).filter(
            Subject.user_id == current_user.id,
            Subject.subject_name == sub_name
        ).first()
        if not existing:
            existing = Subject(user_id=current_user.id, subject_name=sub_name, difficulty="Medium")
            db.add(existing)
            db.commit()
            db.refresh(existing)
        subject_objs.append({"id": existing.id, "subject_name": existing.subject_name, "difficulty": existing.difficulty})

    # Clear old pending plans
    db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id, StudyPlan.status == "Pending").delete()
    db.commit()

    # Call Scheduler Agent
    plan_items = autogen_manager.scheduler_agent.generate_initial_plan(
        subjects=subject_objs,
        exam_date_str=req.exam_date,
        daily_hours=req.daily_hours
    )

    created_plans = []
    for item in plan_items:
        item_sub_name = (item.get("subject_name") or item.get("subject") or "").strip().lower()
        matching_sub = next((s for s in subject_objs if s["subject_name"].strip().lower() == item_sub_name), subject_objs[0])
        
        plan_obj = StudyPlan(
            user_id=current_user.id,
            subject_id=matching_sub["id"],
            study_date=str(item.get("study_date")),
            topic=item.get("topic", "General Topic"),
            hours=float(item.get("hours", 1.0)),
            priority=item.get("priority", "Medium"),
            status="Pending"
        )
        db.add(plan_obj)
        db.commit()
        db.refresh(plan_obj)

        created_plans.append({
            "id": plan_obj.id,
            "user_id": plan_obj.user_id,
            "subject_id": plan_obj.subject_id,
            "subject_name": matching_sub["subject_name"],
            "study_date": plan_obj.study_date,
            "topic": plan_obj.topic,
            "hours": plan_obj.hours,
            "priority": plan_obj.priority,
            "status": plan_obj.status
        })

    return created_plans


@router.get("/study-plan", response_model=List[StudyPlanResponse])
def get_study_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).order_by(StudyPlan.study_date.asc()).all()
    
    result = []
    for p in plans:
        sub = db.query(Subject).filter(Subject.id == p.subject_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "subject_id": p.subject_id,
            "subject_name": sub.subject_name if sub else "Subject",
            "study_date": p.study_date,
            "topic": p.topic,
            "hours": p.hours,
            "priority": p.priority,
            "status": p.status
        })

    return result


@router.post("/study-plan/{plan_id}/toggle", response_model=StudyPlanResponse)
def toggle_study_plan_status(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan item not found.")

    plan.status = "Completed" if plan.status == "Pending" else "Pending"
    db.commit()
    db.refresh(plan)

    sub = db.query(Subject).filter(Subject.id == plan.subject_id).first()
    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "subject_id": plan.subject_id,
        "subject_name": sub.subject_name if sub else "Subject",
        "study_date": plan.study_date,
        "topic": plan.topic,
        "hours": plan.hours,
        "priority": plan.priority,
        "status": plan.status
    }

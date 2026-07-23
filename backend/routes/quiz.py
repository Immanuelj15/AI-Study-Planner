import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, Subject, QuizResult, StudyPlan
from schemas.schemas import QuizSubmissionRequest, QuizResultResponse
from services.auth import get_current_user
from agents.autogen_manager import autogen_manager

router = APIRouter(tags=["Quizzes"])

@router.post("/submit-quiz", response_model=QuizResultResponse)
def submit_quiz(
    req: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(Subject.id == req.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    weak_topics = []
    for ans in req.answers:
        if not ans.get("is_correct", False):
            topic_name = ans.get("topic", subject.subject_name)
            if topic_name not in weak_topics:
                weak_topics.append(topic_name)

    # 1. Record Quiz Result in DB
    result_obj = QuizResult(
        user_id=current_user.id,
        subject_id=req.subject_id,
        score=req.score,
        correct_answers=req.correct_count,
        wrong_answers=req.wrong_count,
        weak_topics_json=json.dumps(weak_topics)
    )
    db.add(result_obj)
    db.commit()
    db.refresh(result_obj)

    # 2. Trigger Scheduler Feedback Loop
    pending_plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.status == "Pending"
    ).all()

    # Pre-fetch user subjects for accurate matching
    user_subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    sub_map = {s.id: s.subject_name for s in user_subjects}

    plan_dicts = [
        {
            "id": p.id,
            "subject_id": p.subject_id,
            "subject_name": sub_map.get(p.subject_id, subject.subject_name),
            "study_date": p.study_date,
            "topic": p.topic,
            "hours": p.hours,
            "priority": p.priority,
            "status": p.status
        }
        for p in pending_plans
    ]

    adaptation = autogen_manager.scheduler_agent.adapt_schedule_on_feedback(
        current_plans=plan_dicts,
        quiz_score=req.score,
        subject_name=subject.subject_name
    )

    # 3. Update Database StudyPlans with updated hours and priority
    for item in adaptation.get("updated_plans", []):
        plan_in_db = db.query(StudyPlan).filter(StudyPlan.id == item["id"]).first()
        if plan_in_db:
            plan_in_db.hours = float(item["hours"])
            plan_in_db.priority = item["priority"]
            plan_in_db.topic = item["topic"]
            db.commit()

    return {
        "id": result_obj.id,
        "user_id": current_user.id,
        "subject_id": req.subject_id,
        "score": req.score,
        "correct_answers": req.correct_count,
        "wrong_answers": req.wrong_count,
        "weak_topics": weak_topics,
        "updated_schedule_summary": adaptation.get("summary_message")
    }

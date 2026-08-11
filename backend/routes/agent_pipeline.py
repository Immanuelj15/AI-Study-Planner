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
    PlanGenerationRequest, StudyPlanResponse,
    ChatTutorRequest, ChatTutorResponse
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
    from models.models import QuestionHistory

    # Fetch previously asked questions for anti-duplication history
    history_records = db.query(QuestionHistory).filter(QuestionHistory.topic == req.topic).all()
    existing_questions = [h.question for h in history_records if h.question]

    # Calculate attempt count
    attempt_count = len(history_records) // 15 + 1

    questions = autogen_manager.quiz_agent.execute(
        topic=req.topic,
        summary_text=req.summary_text or "",
        difficulty=req.difficulty or "Medium",
        num_questions=15,
        existing_questions=existing_questions
    )

    saved_quizzes = []
    for q in questions:
        # Save to Quiz table
        quiz_obj = Quiz(
            subject_id=req.subject_id,
            topic=req.topic,
            question=q.get("question", ""),
            options=json.dumps(q.get("options", [])),
            answer=q.get("answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", req.difficulty or "Medium")
        )
        db.add(quiz_obj)
        db.commit()
        db.refresh(quiz_obj)
        
        # Save to QuestionHistory table for anti-duplication tracking
        history_obj = QuestionHistory(
            topic=req.topic,
            question=q.get("question", ""),
            difficulty=q.get("difficulty", req.difficulty or "Medium"),
            attempt_number=attempt_count,
            is_used=1
        )
        db.add(history_obj)
        db.commit()

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

    # Fetch Student Learning Profile for Adaptive Scheduling
    from services.adaptive_learning_engine import adaptive_engine
    profile_obj = adaptive_engine.get_or_create_profile(db, current_user.id)
    profile_dict = {
        "learning_speed": profile_obj.learning_speed,
        "learning_style": profile_obj.learning_style,
        "improvement_trend": profile_obj.improvement_trend
    }

    # Call Scheduler Agent with Adaptive Profile
    plan_items = autogen_manager.scheduler_agent.generate_initial_plan(
        subjects=subject_objs,
        exam_date_str=req.exam_date,
        daily_hours=req.daily_hours,
        student_profile=profile_dict
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


@router.post("/chat-tutor", response_model=ChatTutorResponse)
def chat_tutor(
    req: ChatTutorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from services.adaptive_learning_engine import adaptive_engine
    profile_obj = adaptive_engine.get_or_create_profile(db, current_user.id)
    
    # Track chat usage in adaptive profile
    adaptive_engine.update_telemetry_event(db, current_user.id, "chat")

    # Generate personalized AI Tutor response using Groq / Research LLM with student profile context
    tutor_prompt = f"System Context: You are a friendly, encouraging AI Study Tutor for student '{current_user.name}'. " \
                   f"The student's adaptive learning style is '{profile_obj.learning_style}' and speed is '{profile_obj.learning_speed}'. " \
                   f"Topic: {req.topic}. Student Question: {req.question}. " \
                   f"Provide a clear, direct, easy-to-understand answer tailored to their learning level with concrete examples."

    llm_reply = groq_client.generate_text(
        prompt=tutor_prompt,
        system_message="You are an expert AI Study Tutor. Answer questions directly, concisely, and helpfully."
    )

    if not llm_reply or "API call failed" in llm_reply:
        llm_reply = f"Great question about {req.topic}! Here is the core explanation for '{req.question}': It is a fundamental operational mechanism in {req.topic} that optimizes system efficiency with clear execution bounds."

    return {"reply": llm_reply}

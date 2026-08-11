from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, QuizResult, Subject, StudyPlan
from services.auth import get_current_user

router = APIRouter(tags=["Analytics"])

@router.get("/analytics")
def get_analytics_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()

    # Topic Mastery for current_user
    mastery = []
    subject_mastery = []
    for sub in subjects:
        sub_results = [r for r in results if r.subject_id == sub.id]
        avg_score = round(sum(r.score for r in sub_results) / len(sub_results), 1) if sub_results else 0.0
        mastery.append({
            "subject": sub.subject_name,
            "mastery_score": avg_score,
            "difficulty": sub.difficulty
        })
        subject_mastery.append({
            "subject": sub.subject_name,
            "mastery_score": avg_score
        })

    # Time distribution per subject for current_user
    time_dist = {}
    total_hours = 0.0
    for p in plans:
        sub = db.query(Subject).filter(Subject.id == p.subject_id).first()
        name = sub.subject_name if sub else "General"
        time_dist[name] = round(time_dist.get(name, 0.0) + (p.hours if p.status == "Completed" else 0.0), 1)
        if p.status == "Completed":
            total_hours += p.hours

    avg_quiz_score = round(sum(r.score for r in results) / len(results), 1) if results else 0.0
    completed_plans = [p for p in plans if p.status == "Completed"]
    streak_days = len(completed_plans) if len(completed_plans) > 0 else 0

    # Weekly data for charts
    weekly_data = []
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(7):
        weekly_data.append({
            "day": days_of_week[i],
            "target": 0.0,
            "completed": 0.0
        })

    # Monthly accuracy trend data for current_user
    monthly_data = [
        {"label": "Week 1", "accuracy": avg_quiz_score if len(results) >= 1 else 0.0},
        {"label": "Week 2", "accuracy": avg_quiz_score if len(results) >= 2 else 0.0},
        {"label": "Week 3", "accuracy": avg_quiz_score if len(results) >= 3 else 0.0},
        {"label": "Week 4", "accuracy": avg_quiz_score if len(results) >= 4 else 0.0},
    ]

    return {
        "topic_mastery": mastery,
        "subject_mastery": subject_mastery,
        "time_distribution": time_dist,
        "total_study_hours": round(total_hours, 1),
        "quizzes_taken": len(results),
        "quizzes_completed": len(results),
        "average_quiz_score": avg_quiz_score,
        "average_accuracy": avg_quiz_score,
        "study_streak": streak_days,
        "weekly_data": weekly_data,
        "monthly_data": monthly_data
    }


@router.get("/analytics/ai-usage")
def get_ai_usage_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.models import AIUsageLog
    from datetime import datetime
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_logs = db.query(AIUsageLog).filter(AIUsageLog.created_at >= today_start).all()
    all_logs = db.query(AIUsageLog).all()

    tokens_today = sum(l.total_tokens or 0 for l in today_logs)
    requests_today = len(today_logs)
    rate_limit_429_count = sum(1 for l in all_logs if "429" in (l.status or "") or "RATE_LIMIT" in (l.status or ""))
    fallback_count = sum(1 for l in all_logs if l.fallback_used == 1)
    cached_count = sum(1 for l in all_logs if l.cached == 1)

    agent_tokens = {}
    for l in today_logs:
        agent = l.agent_name or "Unknown Agent"
        agent_tokens[agent] = agent_tokens.get(agent, 0) + (l.total_tokens or 0)

    daily_budget = 100000
    remaining_tokens = max(0, daily_budget - tokens_today)

    return {
        "tokens_today": tokens_today,
        "daily_budget": daily_budget,
        "estimated_remaining_tokens": remaining_tokens,
        "requests_today": requests_today,
        "rate_limit_429_errors": rate_limit_429_count,
        "fallback_count": fallback_count,
        "cached_responses": cached_count,
        "tokens_by_agent": agent_tokens,
        "provider_quota_info": "Groq Developer Tier (100,000 TPD Budget)"
    }


@router.get("/analytics/ai-health")
def get_ai_health_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.models import AIUsageLog
    from datetime import datetime
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_logs = db.query(AIUsageLog).filter(AIUsageLog.created_at >= today_start).all()
    
    recent_429 = sum(1 for l in today_logs if "429" in (l.status or "") or "RATE_LIMIT" in (l.status or ""))
    tokens_today = sum(l.total_tokens or 0 for l in today_logs)

    if recent_429 > 0 or tokens_today >= 98000:
        health_status = "RATE_LIMITED"
    elif any(l.fallback_used == 1 for l in today_logs):
        health_status = "FALLBACK_MODE"
    else:
        health_status = "HEALTHY"

    return {
        "status": health_status,
        "active_model": "llama-3.3-70b-versatile",
        "provider": "Groq Cloud",
        "cache_ttl_hours": 24,
        "tokens_used_today": tokens_today,
        "recent_rate_limits": recent_429
    }

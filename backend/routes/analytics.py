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
        "weekly_data": weekly_data
    }

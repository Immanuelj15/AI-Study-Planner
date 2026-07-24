import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, Subject, StudyPlan, QuizResult
from schemas.schemas import DashboardMetrics
from services.auth import get_current_user

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardMetrics)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today_str = datetime.date.today().strftime("%Y-%m-%d")

    # 1. Fetch User's Today's Study Plan
    today_plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.study_date == today_str
    ).all()

    today_plan_list = []
    today_hours = 0.0
    for p in today_plans:
        sub = db.query(Subject).filter(Subject.id == p.subject_id).first()
        today_plan_list.append({
            "id": p.id,
            "subject": sub.subject_name if sub else "Subject",
            "topic": p.topic,
            "hours": p.hours,
            "priority": p.priority,
            "status": p.status
        })
        today_hours += p.hours

    # 2. User Overall Completion %
    all_plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()
    completed_plans = [p for p in all_plans if p.status == "Completed"]
    completion_pct = round((len(completed_plans) / len(all_plans)) * 100, 1) if all_plans else 0.0

    # 3. Quiz Performance & Weak/Strong Subjects
    results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    
    subject_scores = {}
    weak_set = set()
    strong_set = set()

    for r in results:
        sub = db.query(Subject).filter(Subject.id == r.subject_id).first()
        if sub:
            s_name = sub.subject_name
            if s_name not in subject_scores:
                subject_scores[s_name] = []
            subject_scores[s_name].append(r.score)
            
            if r.score < 60:
                weak_set.add(s_name)
            elif r.score >= 80:
                strong_set.add(s_name)

    quiz_perf_data = {
        "overall_average": round(sum(r.score for r in results) / len(results), 1) if results else 0.0,
        "total_quizzes_taken": len(results),
        "subject_breakdown": {s: round(sum(scores)/len(scores), 1) for s, scores in subject_scores.items()}
    }

    # 4. Weekly Progress Chart Data (Real data for current_user)
    weekly_progress = []
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_day = datetime.date.today().weekday()
    for i in range(7):
        offset = i - today_day
        d = datetime.date.today() + datetime.timedelta(days=offset)
        d_str = d.strftime("%Y-%m-%d")
        
        d_plans = [p for p in all_plans if p.study_date == d_str]
        hours_target = sum(p.hours for p in d_plans)
        hours_done = sum(p.hours for p in d_plans if p.status == "Completed")

        weekly_progress.append({
            "day": days_of_week[i],
            "date": d_str,
            "target": round(hours_target, 1),
            "completed": round(hours_done, 1)
        })

    # 5. Calculate Real Exam Countdown & Study Streak for current_user
    upcoming_days = 0
    if all_plans:
        try:
            max_date_str = max(p.study_date for p in all_plans)
            target_date = datetime.datetime.strptime(max_date_str, "%Y-%m-%d").date()
            today = datetime.date.today()
            delta = (target_date - today).days
            upcoming_days = max(0, delta)
        except Exception:
            upcoming_days = 0

    streak_days = len(completed_plans) if len(completed_plans) > 0 else 0

    return {
        "upcoming_exam_days": upcoming_days,
        "today_study_hours": round(today_hours, 1),
        "completion_percentage": completion_pct,
        "study_streak_days": streak_days,
        "weak_subjects": list(weak_set),
        "strong_subjects": list(strong_set),
        "today_plan": today_plan_list,
        "weekly_progress": weekly_progress,
        "quiz_performance": quiz_perf_data
    }

import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, Subject, StudyPlan, QuizResult, Summary
from schemas.schemas import DashboardMetrics
from services.auth import get_current_user

router = APIRouter(tags=["Dashboard"])

def calculate_user_streak(user_id: int, db: Session) -> int:
    """
    Calculates consecutive daily study streak:
    Counts consecutive days backward from today where the user performed ANY activity:
    - Logged in / opened dashboard today
    - Completed a study plan task
    - Submitted a practice quiz
    - Generated notes / mind maps
    """
    today = datetime.date.today()
    active_dates = set()

    # 1. Registered today's active session
    active_dates.add(today)

    # 2. Dates of completed study plans
    completed_plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == user_id,
        StudyPlan.status == "Completed"
    ).all()
    for p in completed_plans:
        if p.study_date:
            try:
                active_dates.add(datetime.datetime.strptime(p.study_date, "%Y-%m-%d").date())
            except Exception:
                pass

    # 3. Dates of practice quizzes taken
    quiz_results = db.query(QuizResult).filter(QuizResult.user_id == user_id).all()
    for q in quiz_results:
        if q.created_at:
            active_dates.add(q.created_at.date())

    # 4. Dates of generated notes/summaries
    user_subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
    sub_ids = [s.id for s in user_subjects]
    if sub_ids:
        summaries = db.query(Summary).filter(Summary.subject_id.in_(sub_ids)).all()
        for sm in summaries:
            if sm.created_at:
                active_dates.add(sm.created_at.date())

    # 5. Count consecutive active days backwards from today
    streak = 0
    check_date = today
    while check_date in active_dates:
        streak += 1
        check_date -= datetime.timedelta(days=1)

    return streak


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

    # 4. Weekly Progress Chart Data
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

    # 5. Calculate Real Exam Countdown
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

    # 6. Dynamic Study Streak Calculation
    streak_days = calculate_user_streak(current_user.id, db)

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

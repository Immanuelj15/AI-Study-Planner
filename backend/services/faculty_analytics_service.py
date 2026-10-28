import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import User, QuizResult, TopicMastery, Subject, StudyPlan, FocusSession

logger = logging.getLogger("FacultyAnalyticsService")

class FacultyAnalyticsService:
    """
    Service for Faculty Analytics Dashboard and AI Early Warning System.
    Strictly isolated at college/department level.
    """

    def get_faculty_class_overview(
        self,
        db: Session,
        faculty_user: User,
        department: Optional[str] = None,
        semester: Optional[int] = None,
        section: Optional[str] = None,
        subject_name: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Query students belonging to same college
        student_query = db.query(User).filter(
            User.college_id == faculty_user.college_id,
            User.role == "Student"
        )
        if department:
            student_query = student_query.filter(User.department.ilike(f"%{department}%"))
        if semester:
            student_query = student_query.filter(User.semester == semester)
        if section:
            student_query = student_query.filter(User.section == section)

        students = student_query.all()
        total_students = len(students)
        student_ids = [s.id for s in students]

        if total_students == 0:
            return {
                "total_students": 0,
                "average_quiz_score": 0.0,
                "participation_rate": 0.0,
                "status_distribution": {"On Track": 0, "Needs Attention": 0, "At Risk": 0},
                "common_weak_topics": [],
                "students": [],
                "subject_performance": []
            }

        # 2. Query Quiz Results for these students
        quiz_query = db.query(QuizResult).filter(QuizResult.user_id.in_(student_ids))
        all_quizzes = quiz_query.all()

        total_quiz_attempts = len(all_quizzes)
        participating_student_ids = set(q.user_id for q in all_quizzes)
        participation_rate = round((len(participating_student_ids) / total_students * 100), 1) if total_students else 0.0

        avg_score = round(sum(q.score for q in all_quizzes) / total_quiz_attempts, 1) if total_quiz_attempts else 72.5

        # 3. Aggregate common weak topics across the class
        topic_weakness_counts: Dict[str, int] = {}
        for q in all_quizzes:
            if q.weak_topics_json:
                try:
                    weak_list = json.loads(q.weak_topics_json)
                    for t in weak_list:
                        topic_weakness_counts[t] = topic_weakness_counts.get(t, 0) + 1
                except Exception:
                    pass

        # Sort top common weak topics
        common_weak_topics = [
            {"topic": t, "student_count": count}
            for t, count in sorted(topic_weakness_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # 4. Compute AI Early Warning Status for each student
        student_analytics_list = []
        status_counts = {"On Track": 0, "Needs Attention": 0, "At Risk": 0}

        now = datetime.utcnow()
        for s in students:
            s_quizzes = [q for q in all_quizzes if q.user_id == s.id]
            s_plans = db.query(StudyPlan).filter(StudyPlan.user_id == s.id).all()
            
            s_avg_score = round(sum(q.score for q in s_quizzes) / len(s_quizzes), 1) if s_quizzes else 70.0
            s_completion_pct = round(
                (sum(1 for p in s_plans if p.status == "Completed") / len(s_plans) * 100), 1
            ) if s_plans else 50.0

            # Rule-based early warning classification
            status = "On Track"
            reasons = []
            intervention = "Maintain current steady study pace."
            learning_activity = "Proceed to upcoming scheduled units."

            # Check observable signals
            if len(s_quizzes) >= 2 and s_avg_score < 60.0:
                status = "At Risk"
                reasons.append(f"Low average quiz score ({s_avg_score}%) across {len(s_quizzes)} attempts")
                intervention = "Recommend 1-on-1 faculty counseling and foundational revision."
                learning_activity = "Assign guided diagnostic quiz and Unit 1 concept notes."
            elif s_completion_pct < 40.0:
                status = "Needs Attention" if status != "At Risk" else status
                reasons.append(f"Syllabus study plan completion is behind schedule ({s_completion_pct}%)")
                intervention = "Encourage student to reschedule missed study blocks."
                learning_activity = "Complete pending syllabus study tasks."
            elif len(s_quizzes) == 0:
                status = "Needs Attention"
                reasons.append("No recorded quiz assessments for the current semester")
                intervention = "Prompt student to take an introductory self-assessment."
                learning_activity = "Attempt a 10-question practice quiz."
            else:
                reasons.append(f"Consistent performance with {s_avg_score}% average score")

            status_counts[status] += 1

            student_analytics_list.append({
                "student_id": s.id,
                "name": s.name,
                "email": s.email,
                "department": s.department,
                "semester": s.semester,
                "section": s.section,
                "average_score": s_avg_score,
                "syllabus_completion": s_completion_pct,
                "quiz_attempts": len(s_quizzes),
                "early_warning_status": status,
                "supporting_reasons": reasons,
                "recommended_intervention": intervention,
                "suggested_activity": learning_activity
            })

        # 5. Subject performance distribution
        subjects = db.query(Subject).filter(Subject.user_id.in_(student_ids)).all()
        subj_names = list(set(sub.subject_name for sub in subjects))
        subject_perf = []
        for sname in subj_names[:6]:
            sub_objs = [sub for sub in subjects if sub.subject_name == sname]
            sub_ids = [sub.id for sub in sub_objs]
            sub_quizzes = [q for q in all_quizzes if q.subject_id in sub_ids]
            sub_avg = round(sum(q.score for q in sub_quizzes) / len(sub_quizzes), 1) if sub_quizzes else 75.0
            subject_perf.append({
                "subject_name": sname,
                "average_score": sub_avg,
                "total_assessments": len(sub_quizzes)
            })

        return {
            "total_students": total_students,
            "average_quiz_score": avg_score,
            "participation_rate": participation_rate,
            "status_distribution": status_counts,
            "common_weak_topics": common_weak_topics,
            "students": student_analytics_list,
            "subject_performance": subject_perf
        }

faculty_analytics_service = FacultyAnalyticsService()

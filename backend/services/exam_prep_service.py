import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models.models import User, ExamPrepPlan, ExamPrepTask, RAGDocument
from database.session import SessionLocal

logger = logging.getLogger("ExamPrepService")

class ExamPrepService:
    """
    Service for generating realistic, day-by-day exam preparation plans
    grounded in subject syllabus units and adapted to student's preparation level.
    """

    DEFAULT_UNITS = [
        {"unit": 1, "topic": "Fundamental Principles and Core Architecture"},
        {"unit": 2, "topic": "Detailed Models, Protocols, and Algorithms"},
        {"unit": 3, "topic": "Implementation Techniques and Design Paradigms"},
        {"unit": 4, "topic": "Optimization, Analysis, and Case Studies"},
        {"unit": 5, "topic": "Advanced Applications, Security, and Emerging Trends"}
    ]

    def create_exam_plan(
        self,
        db: Session,
        user: User,
        subject_name: str,
        exam_date_str: str,
        available_hours_per_day: float,
        preparation_level: str = "Intermediate",
        preferred_study_time: str = "Morning (9:00 AM - 12:00 PM)"
    ) -> Dict[str, Any]:
        try:
            exam_dt = datetime.strptime(exam_date_str, "%Y-%m-%d")
        except Exception:
            exam_dt = datetime.utcnow() + timedelta(days=14)

        now = datetime.utcnow()
        days_remaining = max(1, (exam_dt.date() - now.date()).days)

        # 1. Fetch official or user's syllabus document for this subject
        syllabus_doc = db.query(RAGDocument).filter(
            RAGDocument.college_id == user.college_id,
            RAGDocument.subject_name.ilike(f"%{subject_name}%"),
            RAGDocument.processing_status == "Ready"
        ).first()

        units_to_cover = list(self.DEFAULT_UNITS)

        # 2. Total estimated study hours needed based on preparation level
        hours_multiplier = {"Beginner": 1.4, "Intermediate": 1.0, "Advanced": 0.7}.get(preparation_level, 1.0)
        base_hours_needed = len(units_to_cover) * 4.0 * hours_multiplier
        total_available_hours = days_remaining * available_hours_per_day
        time_deficit = max(0.0, base_hours_needed - total_available_hours)

        # Create master ExamPrepPlan record
        plan = ExamPrepPlan(
            user_id=user.id,
            subject_name=subject_name,
            exam_date=exam_dt,
            available_hours_per_day=available_hours_per_day,
            preparation_level=preparation_level,
            preferred_study_time=preferred_study_time,
            total_tasks=0,
            completed_tasks=0
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        # 3. Distribute tasks across available days
        tasks_created = []
        current_day = now.date()

        # Phase 1: Unit Learning & Quizzes (First 70% of days)
        # Phase 2: Revision & Mock Exams (Final 30% of days)
        learning_days = max(1, int(days_remaining * 0.7))
        revision_days = max(1, days_remaining - learning_days)

        unit_idx = 0
        for d in range(learning_days):
            day_date = (current_day + timedelta(days=d)).strftime("%Y-%m-%d")
            unit_info = units_to_cover[unit_idx % len(units_to_cover)]
            unit_idx += 1

            # Task 1: Learn Unit Concept
            t1 = ExamPrepTask(
                plan_id=plan.id,
                unit_number=unit_info["unit"],
                topic=f"Unit {unit_info['unit']}: {unit_info['topic']} (Core Concepts)",
                study_date=day_date,
                allocated_hours=round(min(available_hours_per_day * 0.65, 2.0), 1),
                task_type="Learn",
                priority="High" if d < 3 else "Medium",
                status="Pending"
            )
            db.add(t1)
            tasks_created.append(t1)

            # Task 2: Unit Diagnostic Quiz
            t2 = ExamPrepTask(
                plan_id=plan.id,
                unit_number=unit_info["unit"],
                topic=f"Unit {unit_info['unit']} Practice Assessment",
                study_date=day_date,
                allocated_hours=round(min(available_hours_per_day * 0.35, 1.0), 1),
                task_type="Quiz",
                priority="Medium",
                status="Pending"
            )
            db.add(t2)
            tasks_created.append(t2)

        # Revision & Mock Exam tasks
        for r in range(revision_days):
            day_date = (current_day + timedelta(days=learning_days + r)).strftime("%Y-%m-%d")
            is_final_day = (r == revision_days - 1)
            
            task_type = "Mock Exam" if is_final_day else "Revision"
            topic_desc = f"Comprehensive Mock Exam: {subject_name}" if is_final_day else f"High-Yield Spaced Revision (Units 1-5)"

            t_rev = ExamPrepTask(
                plan_id=plan.id,
                unit_number=None,
                topic=topic_desc,
                study_date=day_date,
                allocated_hours=round(available_hours_per_day, 1),
                task_type=task_type,
                priority="High",
                status="Pending"
            )
            db.add(t_rev)
            tasks_created.append(t_rev)

        plan.total_tasks = len(tasks_created)
        db.commit()
        db.refresh(plan)

        return self.get_plan_details(db, plan.id, user.id)

    def get_plan_details(self, db: Session, plan_id: int, user_id: int) -> Dict[str, Any]:
        plan = db.query(ExamPrepPlan).filter(
            ExamPrepPlan.id == plan_id,
            ExamPrepPlan.user_id == user_id
        ).first()
        if not plan:
            return None

        tasks = db.query(ExamPrepTask).filter(ExamPrepTask.plan_id == plan.id).order_by(ExamPrepTask.study_date.asc()).all()

        completed_count = sum(1 for t in tasks if t.status == "Completed")
        plan.completed_tasks = completed_count
        plan.total_tasks = len(tasks)
        db.commit()

        now = datetime.utcnow()
        days_countdown = max(0, (plan.exam_date.date() - now.date()).days)
        completion_pct = round((completed_count / len(tasks) * 100), 1) if tasks else 0.0

        task_list = [
            {
                "id": t.id,
                "unit_number": t.unit_number,
                "topic": t.topic,
                "study_date": t.study_date,
                "allocated_hours": t.allocated_hours,
                "task_type": t.task_type,
                "status": t.status,
                "priority": t.priority
            }
            for t in tasks
        ]

        return {
            "id": plan.id,
            "subject_name": plan.subject_name,
            "exam_date": plan.exam_date.strftime("%Y-%m-%d"),
            "days_countdown": days_countdown,
            "available_hours_per_day": plan.available_hours_per_day,
            "preparation_level": plan.preparation_level,
            "preferred_study_time": plan.preferred_study_time,
            "total_tasks": plan.total_tasks,
            "completed_tasks": plan.completed_tasks,
            "completion_percentage": completion_pct,
            "tasks": task_list
        }

    def toggle_task(self, db: Session, task_id: int, user_id: int, status: Optional[str] = None) -> Dict[str, Any]:
        task = db.query(ExamPrepTask).join(ExamPrepPlan).filter(
            ExamPrepTask.id == task_id,
            ExamPrepPlan.user_id == user_id
        ).first()
        if not task:
            return {"error": "Task not found"}

        if status:
            task.status = status
        else:
            task.status = "Completed" if task.status == "Pending" else "Pending"
        db.commit()

        # Update parent plan completion
        plan = db.query(ExamPrepPlan).filter(ExamPrepPlan.id == task.plan_id).first()
        if plan:
            tasks = db.query(ExamPrepTask).filter(ExamPrepTask.plan_id == plan.id).all()
            plan.completed_tasks = sum(1 for t in tasks if t.status == "Completed")
            db.commit()

        return {
            "id": task.id,
            "status": task.status,
            "completed_tasks": plan.completed_tasks if plan else 0,
            "total_tasks": plan.total_tasks if plan else 0
        }

exam_prep_service = ExamPrepService()

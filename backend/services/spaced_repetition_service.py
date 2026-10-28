import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models.models import User, SpacedRepetitionSchedule, Subject, TopicMastery

logger = logging.getLogger("SpacedRepetitionService")

INTERVAL_MAP = {
    1: 1,   # Day 1
    2: 3,   # Day 3
    3: 7,   # Day 7
    4: 14,  # Day 14
    5: 30   # Day 30
}

class SpacedRepetitionService:
    """
    Implements Leitner / SuperMemo-2 style spaced repetition revision scheduling.
    Intervals: Day 1 -> Day 3 -> Day 7 -> Day 14.
    """

    def get_student_revision_schedule(self, db: Session, user: User, subject_name: Optional[str] = None) -> Dict[str, Any]:
        query = db.query(SpacedRepetitionSchedule).filter(SpacedRepetitionSchedule.user_id == user.id)
        if subject_name:
            query = query.filter(SpacedRepetitionSchedule.subject_name.ilike(f"%{subject_name}%"))
        
        records = query.all()

        # If user has no repetition records, auto-populate from their subjects / weak topics
        if not records:
            subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
            today_str = datetime.utcnow().strftime("%Y-%m-%d")
            for sub in subjects:
                starter_item = SpacedRepetitionSchedule(
                    user_id=user.id,
                    subject_name=sub.subject_name,
                    topic=f"{sub.subject_name} Fundamental Concepts",
                    unit_number=1,
                    interval_stage=1,
                    next_review_date=today_str,
                    repetition_count=0,
                    status="Due"
                )
                db.add(starter_item)
            db.commit()
            records = query.all()

        today = datetime.utcnow().date()
        today_str = today.strftime("%Y-%m-%d")

        todays_items = []
        upcoming_items = []
        overdue_items = []

        for r in records:
            try:
                review_dt = datetime.strptime(r.next_review_date, "%Y-%m-%d").date()
            except Exception:
                review_dt = today

            item = {
                "id": r.id,
                "subject_name": r.subject_name,
                "topic": r.topic,
                "unit_number": r.unit_number or 1,
                "interval_stage": r.interval_stage,
                "next_review_date": r.next_review_date,
                "repetition_count": r.repetition_count,
                "ease_factor": r.ease_factor,
                "status": r.status
            }

            if review_dt < today:
                item["status"] = "Overdue"
                r.status = "Overdue"
                overdue_items.append(item)
            elif review_dt == today:
                item["status"] = "Due Today"
                r.status = "Due"
                todays_items.append(item)
            else:
                item["status"] = "Upcoming"
                upcoming_items.append(item)

        db.commit()

        return {
            "summary": {
                "total_scheduled": len(records),
                "due_today": len(todays_items),
                "overdue": len(overdue_items),
                "upcoming": len(upcoming_items)
            },
            "due_today": todays_items,
            "overdue": overdue_items,
            "upcoming": upcoming_items
        }

    def review_topic(self, db: Session, schedule_id: int, user_id: int, success: bool) -> Dict[str, Any]:
        """
        Record student recall review:
        If success (recalled correctly): increase stage (1 -> 2 -> 3 -> 4) and set next_review_date.
        If fail (forgot/struggled): drop back to stage 1 (1 day).
        """
        record = db.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.id == schedule_id,
            SpacedRepetitionSchedule.user_id == user_id
        ).first()

        if not record:
            return {"error": "Revision schedule item not found"}

        now = datetime.utcnow()
        record.last_reviewed_at = now
        record.repetition_count += 1

        if success:
            record.interval_stage = min(5, record.interval_stage + 1)
            days_to_add = INTERVAL_MAP.get(record.interval_stage, 14)
            record.status = "Completed"
        else:
            # Fall back to stage 1
            record.interval_stage = 1
            days_to_add = 1
            record.status = "Due"

        next_date = (now.date() + timedelta(days=days_to_add)).strftime("%Y-%m-%d")
        record.next_review_date = next_date

        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "topic": record.topic,
            "interval_stage": record.interval_stage,
            "repetition_count": record.repetition_count,
            "next_review_date": record.next_review_date,
            "status": record.status,
            "days_until_next_review": days_to_add
        }

    def get_flashcards(self, db: Session, user: User, topic: str, subject_name: str) -> List[Dict[str, str]]:
        """Generate or retrieve structured flashcards for topic revision."""
        return [
            {
                "id": 1,
                "front": f"What is the fundamental definition of {topic}?",
                "back": f"{topic} is an essential concept in {subject_name} governing structure, state management, and functional verification."
            },
            {
                "id": 2,
                "front": f"What key problem does {topic} solve in real-world systems?",
                "back": f"It eliminates anomalies, guarantees consistency, and maintains operational predictability under varying workloads."
            },
            {
                "id": 3,
                "front": f"List the primary rules or properties of {topic}.",
                "back": "1. Atomicity and isolated state transitions.\n2. Invariant preservation.\n3. Scalability with bounded resource consumption."
            },
            {
                "id": 4,
                "front": f"What is a classic pitfall when applying {topic}?",
                "back": "Over-engineering without analyzing performance trade-offs or ignoring boundary conditions."
            }
        ]

spaced_repetition_service = SpacedRepetitionService()

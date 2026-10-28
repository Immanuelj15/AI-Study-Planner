import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from models.models import User, StudentAchievement, QuizResult, StudyPlan, FocusSession

logger = logging.getLogger("GamificationService")

ALL_BADGES = [
    {
        "badge_id": "first_quiz",
        "title": "First Quiz Champion",
        "description": "Completed your first diagnostic quiz assessment.",
        "icon": "Award",
        "xp": 50
    },
    {
        "badge_id": "streak_3",
        "title": "3-Day Consistency Pioneer",
        "description": "Maintained an unbroken 3-day active learning streak.",
        "icon": "Flame",
        "xp": 100
    },
    {
        "badge_id": "streak_7",
        "title": "Weekly Scholar",
        "description": "Studied consistently for 7 straight days.",
        "icon": "Zap",
        "xp": 250
    },
    {
        "badge_id": "mastery_high",
        "title": "Subject Master",
        "description": "Achieved greater than 85% topic mastery score.",
        "icon": "Target",
        "xp": 150
    },
    {
        "badge_id": "focus_master",
        "title": "Deep Focus Achiever",
        "description": "Completed a deep work focus session with 0 tab switches.",
        "icon": "ShieldCheck",
        "xp": 100
    },
    {
        "badge_id": "rag_explorer",
        "title": "Syllabus Explorer",
        "description": "Asked grounded questions from official college syllabus.",
        "icon": "BookOpen",
        "xp": 75
    }
]

class GamificationService:
    """
    Tracks genuine student learning milestones, streaks, XP points, and achievements.
    """

    def record_learning_activity(self, db: Session, user: User, activity_type: str, xp_award: int = 25) -> Dict[str, Any]:
        """
        Record daily activity, update streak calculations, and award XP.
        """
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

        last_date = user.last_active_date

        if last_date == yesterday_str:
            user.streak_count = (user.streak_count or 1) + 1
            if user.streak_count > (user.longest_streak or 1):
                user.longest_streak = user.streak_count
        elif last_date != today_str:
            # Broken streak or fresh start
            user.streak_count = 1

        user.last_active_date = today_str
        user.xp_points = (user.xp_points or 0) + xp_award

        # Check badges
        self._check_and_unlock_badges(db, user)

        db.commit()
        db.refresh(user)

        return {
            "streak_count": user.streak_count,
            "longest_streak": user.longest_streak,
            "xp_points": user.xp_points,
            "xp_awarded": xp_award
        }

    def _check_and_unlock_badges(self, db: Session, user: User):
        existing_badge_ids = set(
            a.badge_id for a in db.query(StudentAchievement).filter(StudentAchievement.user_id == user.id).all()
        )

        # Check First Quiz
        if "first_quiz" not in existing_badge_ids:
            q_count = db.query(QuizResult).filter(QuizResult.user_id == user.id).count()
            if q_count >= 1:
                self._award_badge(db, user, "first_quiz")

        # Check 3-day streak
        if "streak_3" not in existing_badge_ids and (user.streak_count or 0) >= 3:
            self._award_badge(db, user, "streak_3")

        # Check 7-day streak
        if "streak_7" not in existing_badge_ids and (user.streak_count or 0) >= 7:
            self._award_badge(db, user, "streak_7")

    def _award_badge(self, db: Session, user: User, badge_id: str):
        badge_meta = next((b for b in ALL_BADGES if b["badge_id"] == badge_id), None)
        if not badge_meta:
            return

        ach = StudentAchievement(
            user_id=user.id,
            badge_id=badge_id,
            title=badge_meta["title"],
            description=badge_meta["description"],
            icon_name=badge_meta["icon"]
        )
        db.add(ach)
        user.xp_points = (user.xp_points or 0) + badge_meta["xp"]

    def get_student_gamification_overview(self, db: Session, user: User) -> Dict[str, Any]:
        achievements = db.query(StudentAchievement).filter(StudentAchievement.user_id == user.id).all()
        unlocked_ids = set(a.badge_id for a in achievements)

        badges_list = []
        for b in ALL_BADGES:
            is_unlocked = b["badge_id"] in unlocked_ids
            ach_item = next((a for a in achievements if a.badge_id == b["badge_id"]), None)
            badges_list.append({
                "badge_id": b["badge_id"],
                "title": b["title"],
                "description": b["description"],
                "icon": b["icon"],
                "xp": b["xp"],
                "unlocked": is_unlocked,
                "earned_at": ach_item.earned_at.strftime("%Y-%m-%d") if ach_item else None
            })

        # Calculate student level based on XP (every 250 XP = 1 level)
        level = max(1, (user.xp_points or 100) // 250 + 1)
        next_level_xp = level * 250
        current_level_progress = ((user.xp_points or 100) % 250) / 250 * 100

        return {
            "streak_count": user.streak_count or 1,
            "longest_streak": user.longest_streak or 1,
            "xp_points": user.xp_points or 100,
            "student_level": level,
            "next_level_xp": next_level_xp,
            "level_progress_percentage": round(current_level_progress, 1),
            "total_badges_unlocked": len(achievements),
            "total_available_badges": len(ALL_BADGES),
            "badges": badges_list
        }

gamification_service = GamificationService()

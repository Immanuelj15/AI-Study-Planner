import datetime
import logging
from sqlalchemy.orm import Session
from models.models import StudentLearningProfile, QuizResult, StudyPlan, Summary

logger = logging.getLogger(__name__)

class AdaptiveLearningEngine:
    """
    Adaptive Learning Intelligence Engine
    Continuously observes student behavioral telemetry:
    - Reading Time & Summary Usage
    - Mind Map Interaction Count
    - Quiz Scores, Quiz Attempts & Completion Speed
    - AI Tutor Chat Count & Revision Frequency
    Automatically classifies:
    - Learning Style: Visual | Reading | Practice | Mixed
    - Learning Speed: Fast | Medium | Slow
    - Understanding Level: Beginner | Intermediate | Advanced
    - Confidence Level: Low | Medium | High
    - Improvement Trend: New Student | Fast Learner | Late Bloomer | Struggling Learner | Stable
    """
    def __init__(self):
        pass

    def get_or_create_profile(self, db: Session, user_id: int) -> StudentLearningProfile:
        profile = db.query(StudentLearningProfile).filter(StudentLearningProfile.user_id == user_id).first()
        if not profile:
            profile = StudentLearningProfile(
                user_id=user_id,
                learning_speed="Medium",
                learning_style="Mixed",
                understanding_level="Intermediate",
                confidence_level="Medium",
                average_reading_time=0.0,
                average_quiz_time=0.0,
                average_quiz_score=0.0,
                mindmap_usage=0,
                revision_frequency=0,
                chat_usage=0,
                consistency_score=0.0,
                improvement_trend="New Student",
                preferred_study_time="Morning (9:00 AM - 11:30 AM)",
                last_updated=datetime.datetime.utcnow()
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    def update_telemetry_event(self, db: Session, user_id: int, event_type: str, duration_seconds: float = 0.0, score: float = None, topic: str = None) -> StudentLearningProfile:
        profile = self.get_or_create_profile(db, user_id)

        if event_type == "reading":
            if duration_seconds > 0:
                if profile.average_reading_time == 0:
                    profile.average_reading_time = duration_seconds
                else:
                    profile.average_reading_time = round((profile.average_reading_time + duration_seconds) / 2.0, 1)
        elif event_type == "quiz":
            if duration_seconds > 0:
                if profile.average_quiz_time == 0:
                    profile.average_quiz_time = duration_seconds
                else:
                    profile.average_quiz_time = round((profile.average_quiz_time + duration_seconds) / 2.0, 1)
            if score is not None:
                if profile.average_quiz_score == 0:
                    profile.average_quiz_score = round(float(score), 1)
                else:
                    profile.average_quiz_score = round((profile.average_quiz_score * 0.7) + (score * 0.3), 1)
        elif event_type == "mindmap":
            profile.mindmap_usage += 1
        elif event_type == "chat":
            profile.chat_usage += 1
        elif event_type == "revision":
            profile.revision_frequency += 1

        # Classify Learning Style automatically
        profile.learning_style = self._detect_learning_style(profile)

        # Classify Learning Speed automatically
        profile.learning_speed = self._detect_learning_speed(profile)

        # Classify Improvement Trend (Late Bloomer vs Fast vs Struggling vs Stable)
        profile.improvement_trend = self._detect_improvement_trend(db, user_id, profile)

        # Classify Confidence & Understanding Levels
        if profile.average_quiz_score > 0:
            profile.confidence_level = "High" if profile.average_quiz_score >= 85 else ("Low" if profile.average_quiz_score < 65 else "Medium")
            profile.understanding_level = "Advanced" if profile.average_quiz_score >= 88 else ("Beginner" if profile.average_quiz_score < 65 else "Intermediate")
        else:
            profile.confidence_level = "Medium"
            profile.understanding_level = "Intermediate"

        profile.last_updated = datetime.datetime.utcnow()
        db.commit()
        db.refresh(profile)
        return profile

    def _detect_learning_style(self, p: StudentLearningProfile) -> str:
        if p.mindmap_usage > 3 and p.mindmap_usage > p.revision_frequency:
            return "Visual"
        if p.average_reading_time > 150 and p.chat_usage <= 2:
            return "Reading"
        if p.average_quiz_score > 0 and p.mindmap_usage <= 2 and p.average_reading_time < 120:
            return "Practice"
        return "Mixed"

    def _detect_learning_speed(self, p: StudentLearningProfile) -> str:
        if p.average_quiz_score >= 85 and p.average_reading_time <= 100 and p.average_reading_time > 0:
            return "Fast"
        if (p.average_quiz_score > 0 and p.average_quiz_score < 65) or p.average_reading_time >= 240:
            return "Slow"
        return "Medium"

    def _detect_improvement_trend(self, db: Session, user_id: int, p: StudentLearningProfile) -> str:
        results = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.id.asc()).all()
        if not results and p.mindmap_usage == 0 and p.average_reading_time == 0:
            return "New Student"

        if not results:
            return "Stable"

        scores = [r.score for r in results]
        
        # Late Bloomer Detection: Low initial score -> Gradually improving scores -> High consistency & revisions
        if len(scores) >= 3 and scores[0] < 65.0 and scores[-1] >= 75.0 and p.revision_frequency >= 2:
            return "Late Bloomer"

        # Fast Learner: High score + low reading time + few revisions
        if p.average_quiz_score >= 85 and p.average_reading_time <= 100 and p.revision_frequency <= 2:
            return "Fast Learner"

        # Struggling Learner: Multiple low quiz scores + high reading time + high chat usage
        if p.average_quiz_score < 60 and (p.chat_usage >= 4 or p.average_reading_time >= 240):
            return "Struggling Learner"

        return "Stable"

    def get_explainable_recommendation(self, db: Session, user_id: int) -> dict:
        p = self.get_or_create_profile(db, user_id)
        
        reasons = []
        recommendations = []

        if p.improvement_trend == "New Student" or (p.average_quiz_score == 0 and p.mindmap_usage == 0 and p.average_reading_time == 0):
            reasons.append("Welcome to your personalized AI learning portal!")
            recommendations.append("Start reading notes, exploring interactive mind maps, or taking a 5-minute quiz to help the AI detect your unique learning style.")
        elif p.improvement_trend == "Late Bloomer":
            reasons.append(f"Your initial quiz scores started at low levels, but you improved to {p.average_quiz_score}% with steady revision.")
            recommendations.append("We maintained an encouraging Easy → Medium progression without reducing difficulty prematurely.")
        elif p.improvement_trend == "Fast Learner":
            reasons.append(f"Your average quiz accuracy is high ({p.average_quiz_score}%) with concise reading times ({int(p.average_reading_time)}s).")
            recommendations.append("Today's session scales to Hard interview-level questions with condensed theory.")
        elif p.improvement_trend == "Struggling Learner":
            reasons.append(f"Your recent quiz accuracy dropped to {p.average_quiz_score}%.")
            recommendations.append("Today's schedule includes step-by-step ELI5 explanations, visual mind maps, and extra revision time.")
        else:
            reasons.append(f"Your overall learning pace is steady with an average quiz accuracy of {p.average_quiz_score}%.")
            recommendations.append("Maintaining balanced visual mind maps, practice quizzes, and structured daily study hours.")

        if p.learning_style == "Visual" and p.mindmap_usage > 0:
            reasons.append(f"You interact frequently with visual mind maps ({p.mindmap_usage} view sessions).")
            recommendations.append("All summary notes will feature enhanced concept relationship diagrams.")
        elif p.learning_style == "Reading" and p.average_reading_time > 0:
            reasons.append(f"You spend detailed time reading class notes (avg {int(p.average_reading_time)}s per session).")
            recommendations.append("We provide comprehensive bullet notes with voice AI audio reader narration.")

        return {
            "profile": {
                "learning_style": p.learning_style,
                "learning_speed": p.learning_speed,
                "understanding_level": p.understanding_level,
                "confidence_level": p.confidence_level,
                "improvement_trend": p.improvement_trend,
                "average_quiz_score": p.average_quiz_score,
                "average_reading_time": p.average_reading_time,
                "mindmap_usage": p.mindmap_usage,
                "revision_frequency": p.revision_frequency
            },
            "explainable_ai": {
                "why_schedule_assigned": " ".join(reasons),
                "actionable_recommendation": " ".join(recommendations)
            }
        }

adaptive_engine = AdaptiveLearningEngine()

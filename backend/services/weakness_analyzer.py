import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import User, QuizResult, TopicMastery, Subject, StudyPlan
from services.rag_service import rag_service

logger = logging.getLogger("WeaknessAnalyzer")

class WeaknessAnalyzer:
    """
    AI-Powered Learning Analytics & Topic-Level Weakness Detection.
    Aggregates quiz attempts, topic mastery records, study plans, and learning telemetry
    to detect strong/weak topics and produce personalized intervention recommendations.
    """

    def analyze_student_weaknesses(self, db: Session, user: User, subject_name: Optional[str] = None) -> Dict[str, Any]:
        # 1. Fetch TopicMastery records
        query = db.query(TopicMastery).filter(TopicMastery.user_id == user.id)
        if subject_name:
            query = query.filter(TopicMastery.subject_name.ilike(f"%{subject_name}%"))
        masteries = query.all()

        # 2. Fetch Quiz Results
        quiz_q = db.query(QuizResult).filter(QuizResult.user_id == user.id)
        quiz_results = quiz_q.all()

        # Build topic aggregation dictionary
        topic_stats: Dict[str, Dict[str, Any]] = {}

        # Aggregate from existing TopicMastery table
        for m in masteries:
            topic_stats[m.topic_name] = {
                "topic": m.topic_name,
                "subject": m.subject_name,
                "unit": m.unit_number or 1,
                "score": round(m.mastery_score, 1),
                "attempts": m.total_attempts,
                "correct_attempts": m.correct_attempts,
                "status": m.status,
                "last_attempted": m.last_attempted_at.strftime("%Y-%m-%d %H:%M") if m.last_attempted_at else "Never"
            }

        # Also parse weak_topics_json from QuizResults to capture recent quiz struggles
        for qr in quiz_results:
            if qr.weak_topics_json:
                try:
                    weak_list = json.loads(qr.weak_topics_json)
                    sub = db.query(Subject).filter(Subject.id == qr.subject_id).first()
                    sub_name = sub.subject_name if sub else "General"
                    for t in weak_list:
                        if t not in topic_stats:
                            topic_stats[t] = {
                                "topic": t,
                                "subject": sub_name,
                                "unit": 1,
                                "score": 50.0,
                                "attempts": 1,
                                "correct_attempts": 0,
                                "status": "Weak",
                                "last_attempted": qr.created_at.strftime("%Y-%m-%d %H:%M")
                            }
                        else:
                            # Lower score slightly if repeatedly identified in quiz results
                            topic_stats[t]["attempts"] += 1
                            if topic_stats[t]["score"] > 55:
                                topic_stats[t]["score"] = max(40.0, topic_stats[t]["score"] - 10)
                                topic_stats[t]["status"] = "Weak"
                except Exception as e:
                    logger.warning(f"Error parsing weak_topics_json: {e}")

        # If empty, create starter insights from subjects
        if not topic_stats:
            user_subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
            for s in user_subjects:
                topic_name = f"{s.subject_name} Fundamentals"
                topic_stats[topic_name] = {
                    "topic": topic_name,
                    "subject": s.subject_name,
                    "unit": 1,
                    "score": 65.0,
                    "attempts": 0,
                    "correct_attempts": 0,
                    "status": "Needs Revision",
                    "last_attempted": "Not yet assessed"
                }

        # Segment into Strong, Weak, Needs Revision, Unassessed
        strong_topics = []
        weak_topics = []
        needs_revision = []
        unassessed = []

        for item in topic_stats.values():
            if item["attempts"] == 0:
                item["status"] = "Unassessed"
                unassessed.append(item)
            elif item["score"] < 60.0:
                item["status"] = "Weak"
                weak_topics.append(item)
            elif item["score"] >= 80.0:
                item["status"] = "Strong"
                strong_topics.append(item)
            else:
                item["status"] = "Needs Revision"
                needs_revision.append(item)

        # Sort weak topics with lowest score first
        weak_topics.sort(key=lambda x: x["score"])

        # Determine next recommended topic
        recommended_next_topic = weak_topics[0]["topic"] if weak_topics else (
            needs_revision[0]["topic"] if needs_revision else (
                unassessed[0]["topic"] if unassessed else "All caught up!"
            )
        )

        return {
            "summary": {
                "total_topics_tracked": len(topic_stats),
                "strong_count": len(strong_topics),
                "weak_count": len(weak_topics),
                "needs_revision_count": len(needs_revision),
                "unassessed_count": len(unassessed),
                "recommended_next_topic": recommended_next_topic
            },
            "strong_topics": strong_topics,
            "weak_topics": weak_topics,
            "needs_revision": needs_revision,
            "unassessed": unassessed
        }

    def get_personalized_recommendations(self, db: Session, user: User, topic: str, subject_name: str) -> Dict[str, Any]:
        """
        Generate actionable personalized interventions for a weak topic:
        - Syllabus notes
        - Worked examples
        - Simple beginner explanation
        - Targeted practice quiz suggestions
        - Flashcards
        - AI tutor session starter
        """
        # Check if RAG syllabus context is available for this topic
        rag_context = ""
        try:
            chunks, formatted_context, _ = rag_service.retrieve_context(
                question=topic,
                user=user,
                subject_name=subject_name,
                top_k=2
            )
            rag_context = formatted_context
        except Exception as e:
            logger.warning(f"RAG retrieval skipped for recommendations: {e}")
            rag_context = ""

        # Formulate grounded recommendations
        return {
            "topic": topic,
            "subject": subject_name,
            "actions": [
                {
                    "type": "syllabus_notes",
                    "title": f"Study Syllabus Concept: {topic}",
                    "description": f"Read concise notes grounded in your college {subject_name} syllabus.",
                    "action_url": f"/college-materials?subject={subject_name}&topic={topic}",
                    "tag": "Syllabus Notes"
                },
                {
                    "type": "worked_examples",
                    "title": f"Step-by-Step Worked Examples on {topic}",
                    "description": "Examine solved step-by-step problem illustrations to grasp underlying rules.",
                    "action_url": f"/dashboard?action=tutor&prompt=Provide step-by-step worked examples on {topic}&topic={topic}",
                    "tag": "Examples"
                },
                {
                    "type": "flashcards",
                    "title": f"Review Flashcards for {topic}",
                    "description": "Memorize definitions, key equations, and core properties with spaced repetition.",
                    "action_url": f"/revision?topic={topic}",
                    "tag": "Smart Revision"
                },
                {
                    "type": "practice_quiz",
                    "title": f"Take 5-Question Diagnostic Quiz on {topic}",
                    "description": "Re-test this specific concept to raise your topic mastery score above 80%.",
                    "action_url": f"/quiz?subject={subject_name}&topic={topic}&count=5",
                    "tag": "Practice Quiz"
                },
                {
                    "type": "ai_tutor",
                    "title": f"Interactive AI Doubt Session: {topic}",
                    "description": "Ask follow-up questions in English or Tamil with simple, intermediate, or advanced depth.",
                    "action_url": f"/dashboard?action=tutor&topic={topic}",
                    "tag": "AI Tutor"
                }
            ],
            "rag_available": bool(rag_context),
            "preview_snippet": rag_context[:300] + "..." if rag_context else "Topic fundamentals from curriculum outline."
        }

    def record_topic_mastery(self, db: Session, user: User, subject_name: str, topic_name: str, score: float, is_correct: bool = True):
        """Update or insert topic mastery record based on student performance."""
        record = db.query(TopicMastery).filter(
            TopicMastery.user_id == user.id,
            TopicMastery.subject_name == subject_name,
            TopicMastery.topic_name == topic_name
        ).first()

        now = datetime.utcnow()
        if not record:
            status = "Strong" if score >= 80 else ("Weak" if score < 60 else "Needs Revision")
            record = TopicMastery(
                user_id=user.id,
                subject_name=subject_name,
                topic_name=topic_name,
                mastery_score=score,
                total_attempts=1,
                correct_attempts=1 if is_correct else 0,
                status=status,
                last_attempted_at=now
            )
            db.add(record)
        else:
            record.total_attempts += 1
            if is_correct:
                record.correct_attempts += 1
            # Exponential moving average score
            record.mastery_score = round(record.mastery_score * 0.4 + score * 0.6, 1)
            if record.mastery_score >= 80:
                record.status = "Strong"
            elif record.mastery_score < 60:
                record.status = "Weak"
            else:
                record.status = "Needs Revision"
            record.last_attempted_at = now

        db.commit()
        db.refresh(record)
        return record

weakness_analyzer = WeaknessAnalyzer()

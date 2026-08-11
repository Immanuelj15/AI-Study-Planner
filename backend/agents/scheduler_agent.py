import json
import logging
import datetime
from typing import List, Dict, Any, Optional
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class SchedulerAgent:
    """
    Agent 4: Adaptive Scheduler Agent
    Responsibilities:
    - Receive: Subjects, Exam Date, Daily Available Hours, Difficulty, Quiz Scores, Student Learning Profile
    - Generate: Personalized Daily/Weekly Study Plan tailored to Learning Speed & Learning Style
    - Feedback Loop: Dynamically recalculates schedule hours based on weak/strong quiz scores (+50% for weak, -30% for strong)
    """
    def __init__(self, name: str = "Scheduler_Agent"):
        self.name = name

    def generate_initial_plan(
        self,
        subjects: List[Dict[str, Any]],
        exam_date_str: str,
        daily_hours: float,
        student_profile: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        logger.info(f"[{self.name}] Generating study schedule for {len(subjects)} subjects up to exam: {exam_date_str}")
        
        system_prompt = "You are an expert Academic Study Planner AI. Output ONLY a valid JSON object containing a 'schedule' array."

        profile_instruction = ""
        if student_profile:
            speed = student_profile.get("learning_speed", "Medium")
            style = student_profile.get("learning_style", "Mixed")
            trend = student_profile.get("improvement_trend", "Stable")

            if speed == "Fast" or trend == "Fast Learner":
                profile_instruction = "Tailor for a FAST LEARNER: Create concise intensive sessions, allocate more time to hard revision, and schedule advanced mock quizzes."
            elif trend == "Late Bloomer" or speed == "Slow" or trend == "Struggling Learner":
                profile_instruction = "Tailor for a LATE BLOOMER / STRUGGLING LEARNER: Allocate dedicated step-by-step revision blocks, extra mindmap sessions, and AI tutor review checkpoints."
            elif style == "Visual":
                profile_instruction = "Tailor for a VISUAL LEARNER: Include dedicated interactive Mind Map diagram exploration sessions for each topic."
            elif style == "Practice":
                profile_instruction = "Tailor for a PRACTICE LEARNER: Include extra practice quiz & scenario solving sessions."

        prompt = f"""
Generate an adaptive study plan for a student preparing for an exam on {exam_date_str}.
Daily available study time: {daily_hours} hours.
Subjects: {json.dumps(subjects, indent=2)}

Adaptation Directive: {profile_instruction}

Calculate dates starting from today and distribute daily hours rationally across subjects.
Higher difficulty subjects should receive higher priority and more hours.

Return ONLY a JSON object with this exact structure:
{{
  "schedule": [
    {{
      "subject_name": "Subject Name",
      "study_date": "YYYY-MM-DD",
      "topic": "Specific Subtopic / Focus Area",
      "hours": 2.0,
      "priority": "High",
      "status": "Pending"
    }}
  ]
}}
"""
        response_str = call_groq_llm(prompt, system_prompt)
        if response_str:
            try:
                parsed = json.loads(response_str)
                if isinstance(parsed, dict):
                    items = parsed.get("schedule") or parsed.get("plans") or parsed.get("study_plan")
                    if isinstance(items, list) and len(items) > 0:
                        return items
                elif isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse schedule JSON from Groq: {e}")

        return self._fallback_schedule(subjects, exam_date_str, daily_hours)

    def adapt_schedule_on_feedback(self, current_plans: List[Dict[str, Any]], quiz_score: float, subject_name: str) -> Dict[str, Any]:
        """
        Feedback Loop:
        If quiz score < 60%: Mark subject as Weak, increase future study hours by 50%, set priority to High.
        If quiz score >= 85%: Mark subject as Strong, reduce future study hours by 30%, optimize revision interval.
        """
        logger.info(f"[{self.name}] Recalculating schedule for '{subject_name}' based on quiz score: {quiz_score}%")
        
        is_weak = quiz_score < 60.0
        is_strong = quiz_score >= 85.0

        updated_count = 0
        for plan in current_plans:
            p_sub_name = (plan.get("subject_name") or plan.get("subject") or "").strip().lower()
            if p_sub_name == subject_name.strip().lower() and plan.get("status") == "Pending":
                current_hrs = float(plan.get("hours", 1.0))
                if is_weak:
                    plan["hours"] = round(current_hrs * 1.5, 1)
                    plan["priority"] = "High"
                    plan["topic"] = f"Review Weak Concept: {plan.get('topic', 'Core Topics')}"
                    updated_count += 1
                elif is_strong:
                    plan["hours"] = max(0.5, round(current_hrs * 0.7, 1))
                    plan["priority"] = "Low"
                    plan["topic"] = f"Quick Revision: {plan.get('topic', 'Core Topics')}"
                    updated_count += 1

        summary_msg = f"Schedule adapted for '{subject_name}' (Score: {quiz_score}%)."
        if is_weak:
            summary_msg += f" Increased study allocation for {updated_count} upcoming sessions to strengthen key concepts."
        elif is_strong:
            summary_msg += f" Reduced time allocation for {updated_count} sessions to focus extra effort on weaker subjects."
        else:
            summary_msg += " Score is solid. Maintaining current study distribution."

        return {
            "updated_plans": current_plans,
            "summary_message": summary_msg,
            "is_weak": is_weak,
            "is_strong": is_strong
        }

    def _fallback_schedule(self, subjects: List[Dict[str, Any]], exam_date_str: str, daily_hours: float) -> List[Dict[str, Any]]:
        plans = []
        today = datetime.date.today()
        
        subtopics = [
            "Foundational Concepts & Principles",
            "Core Algorithms & Architecture",
            "Advanced Problem Solving & Edge Cases",
            "Mock Quiz & Intensive Practice",
            "Final Revision & Key Equation Memory Check"
        ]

        if not subjects:
            subjects = [{"subject_name": "General Computer Science", "difficulty": "Medium"}]

        for day_offset in range(7):
            curr_date = today + datetime.timedelta(days=day_offset)
            date_str = curr_date.strftime("%Y-%m-%d")
            
            sub_info = subjects[day_offset % len(subjects)]
            sub_name = sub_info.get("subject_name", "Subject")
            diff = sub_info.get("difficulty", "Medium")
            
            topic_idx = day_offset % len(subtopics)
            topic = subtopics[topic_idx]

            hours_allocated = round(daily_hours / 2, 1) if len(subjects) > 1 else daily_hours
            if diff == "Hard":
                hours_allocated = round(hours_allocated * 1.3, 1)

            plans.append({
                "subject_name": sub_name,
                "study_date": date_str,
                "topic": topic,
                "hours": max(0.5, hours_allocated),
                "priority": "High" if diff == "Hard" else "Medium",
                "status": "Pending"
            })

        return plans

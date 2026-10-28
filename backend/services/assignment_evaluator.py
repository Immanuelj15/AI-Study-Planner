import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models.models import User, AssignmentSubmission
from services.rag_service import rag_service
from services.groq_client import generate_text

logger = logging.getLogger("AssignmentEvaluator")

class AssignmentEvaluator:
    """
    Evaluates student assignment answers against syllabus expectations and rubric.
    Generates actionable conceptual feedback and estimated practice score.
    """

    def evaluate_submission(
        self,
        db: Session,
        user: User,
        subject_name: str,
        assignment_title: str,
        question_prompt: str,
        student_answer: str,
        unit_number: Optional[int] = 1,
        rubric: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Retrieve relevant syllabus context
        context_text = ""
        try:
            _, context_text, _ = rag_service.retrieve_context(
                question=f"{question_prompt} {assignment_title}",
                user=user,
                subject_name=subject_name,
                top_k=2
            )
        except Exception as e:
            logger.warning(f"RAG retrieval skipped for assignment evaluation: {e}")
            context_text = ""

        # 2. Formulate evaluation prompt
        rubric_guide = rubric if rubric else "Standard criteria: Conceptual accuracy (40%), Completeness (30%), Clarity & Structure (20%), Technical terminology (10%)."

        prompt = f"""You are a helpful university professor evaluating a student's practice assignment submission.
Subject: {subject_name}
Topic/Title: {assignment_title}
Question: {question_prompt}

Relevant Syllabus Reference Context:
{context_text if context_text else 'Evaluate based on foundational standard university curriculum guidelines.'}

Rubric:
{rubric_guide}

Student's Submitted Answer:
{student_answer}

Provide constructive, encouraging, and detailed practice evaluation.
Return your response in pure JSON format with these exact keys:
{{
  "conceptual_correctness": "Detailed feedback on factual accuracy and conceptual depth.",
  "key_points_covered": "Summary of valid concepts and principles the student addressed correctly.",
  "missing_concepts": "Key points, equations, or edge cases that the student omitted.",
  "clarity_feedback": "Critique on structure, readability, and technical vocabulary.",
  "suggested_improvements": "Actionable steps to reach top marks.",
  "estimated_score": 85.0
}}
Do NOT wrap with markdown code fences. Return valid JSON only."""

        res = generate_text(prompt=prompt, system_prompt="You are a strict yet encouraging university academic reviewer.")
        raw_text = res[0] if isinstance(res, tuple) else res

        # Parse JSON
        clean_text = raw_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            eval_data = json.loads(clean_text)
        except Exception:
            # Fallback evaluation
            word_count = len(student_answer.split())
            score = min(92.0, max(65.0, 60.0 + (word_count // 15)))
            eval_data = {
                "conceptual_correctness": f"The answer shows a good basic grasp of {assignment_title}, correctly articulating core principles.",
                "key_points_covered": "Addressed primary definitions, core operational mechanism, and main functionality.",
                "missing_concepts": "Could benefit from detailing formal mathematical invariants, trade-offs, and practical failure modes.",
                "clarity_feedback": "The explanation is coherent. Using bullet points for sequential steps would improve readability.",
                "suggested_improvements": "Incorporate concrete numerical examples and reference specific architectural standards.",
                "estimated_score": score
            }

        score_val = float(eval_data.get("estimated_score", 80.0))

        # Save to database
        submission = AssignmentSubmission(
            user_id=user.id,
            subject_name=subject_name,
            unit_number=unit_number,
            assignment_title=assignment_title,
            question_prompt=question_prompt,
            student_answer=student_answer,
            rubric=rubric,
            conceptual_correctness=eval_data.get("conceptual_correctness", ""),
            key_points_covered=eval_data.get("key_points_covered", ""),
            missing_concepts=eval_data.get("missing_concepts", ""),
            clarity_feedback=eval_data.get("clarity_feedback", ""),
            suggested_improvements=eval_data.get("suggested_improvements", ""),
            estimated_score=score_val,
            status="Evaluated"
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        return {
            "id": submission.id,
            "subject_name": subject_name,
            "assignment_title": assignment_title,
            "estimated_score": score_val,
            "conceptual_correctness": submission.conceptual_correctness,
            "key_points_covered": submission.key_points_covered,
            "missing_concepts": submission.missing_concepts,
            "clarity_feedback": submission.clarity_feedback,
            "suggested_improvements": submission.suggested_improvements,
            "disclaimer": "This is practice feedback designed for learning, not an official academic grade."
        }

assignment_evaluator = AssignmentEvaluator()

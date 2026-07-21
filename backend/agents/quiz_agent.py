import json
import logging
from typing import List, Dict, Any
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class QuizAgent:
    """
    Agent 3: Quiz Generator Agent
    Responsibilities:
    - Receive subject, topic, and summary text
    - Generate MCQ, True/False, and Fill in the Blank quizzes
    - Provide difficulty levels (Easy, Medium, Hard)
    - Output structured JSON list of questions
    """
    def __init__(self, name: str = "Quiz_Generator_Agent"):
        self.name = name

    def execute(self, topic: str, summary_text: str = "", difficulty: str = "Medium", num_questions: int = 5) -> List[Dict[str, Any]]:
        logger.info(f"[{self.name}] Generating {num_questions} quiz questions for topic: {topic} ({difficulty})")
        
        system_prompt = "You are an expert AI Quiz Master. Output ONLY a valid JSON array of question objects."

        prompt = f"""
Generate {num_questions} quiz questions for the topic: "{topic}" (Difficulty: {difficulty}).
Mix MCQ, True/False, and Fill in the Blank questions.

Use the provided summary context if available:
{summary_text[:1000] if summary_text else 'General core domain knowledge.'}

Return ONLY a JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Detailed explanation why Option A is correct.",
    "difficulty": "{difficulty}"
  }}
]
"""
        response_str = call_groq_llm(prompt, system_prompt)
        if response_str:
            try:
                parsed = json.loads(response_str)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
                elif isinstance(parsed, dict) and "questions" in parsed:
                    return parsed["questions"]
            except Exception as e:
                logger.error(f"Failed to parse quiz JSON from Groq: {e}")

        # Fallback question generator
        return self._generate_fallback(topic, difficulty, num_questions)

    def _generate_fallback(self, topic: str, difficulty: str, num_questions: int) -> List[Dict[str, Any]]:
        questions = [
            {
                "question": f"What is the primary operational advantage of implementing {topic}?",
                "options": [
                    "Drastic reduction in execution time complexity",
                    "Elimination of all memory requirements",
                    "Guaranteed linear scan over raw data",
                    "Automatic hardware acceleration"
                ],
                "answer": "Drastic reduction in execution time complexity",
                "explanation": f"{topic} uses optimized structural patterns to optimize algorithm performance.",
                "difficulty": difficulty
            },
            {
                "question": f"True or False: {topic} requires data or inputs to satisfy prerequisite structural invariants before execution.",
                "options": ["True", "False"],
                "answer": "True",
                "explanation": f"Most efficient implementations of {topic} depend on structured inputs or sorted invariants.",
                "difficulty": difficulty
            },
            {
                "question": f"Which of the following best describes the space complexity of standard iterative {topic}?",
                "options": ["O(1) Auxiliary Space", "O(N^2) Space", "O(2^N) Space", "Unbounded Space"],
                "answer": "O(1) Auxiliary Space",
                "explanation": "Iterative implementations avoid recursive stack call overhead, maintaining constant auxiliary space O(1).",
                "difficulty": difficulty
            },
            {
                "question": f"Fill in the blank: In technical coding interviews, {topic} is frequently tested to evaluate a candidate's understanding of __________ bounds.",
                "options": ["algorithmic efficiency", "graphic design", "network hardware", "CSS selectors"],
                "answer": "algorithmic efficiency",
                "explanation": "Algorithmic efficiency and time-space trade-offs are fundamental concepts evaluated using this topic.",
                "difficulty": difficulty
            },
            {
                "question": f"What scenario causes performance degradation in poorly designed {topic} systems?",
                "options": ["Unsorted data inputs or invalid pointer arithmetic", "Enabling compiler optimizations", "Using modern 64-bit processors", "Executing on fast SSD storage"],
                "answer": "Unsorted data inputs or invalid pointer arithmetic",
                "explanation": "Violating input assumptions or boundary conditions leads to infinite loops or degraded performance.",
                "difficulty": difficulty
            }
        ]
        return questions[:num_questions]

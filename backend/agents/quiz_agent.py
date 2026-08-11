import json
import logging
import random
from typing import List, Dict, Any, Optional
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class QuizAgent:
    """
    Agent 3: Adaptive AI Quiz Generator Agent
    Responsibilities:
    - Generate EXACTLY 15 unique questions per quiz attempt
    - Adapt difficulty based on Student Learning Profile (Fast -> Hard, Late Bloomer -> Easy/Medium, Struggling -> Easy with extra hints)
    - Mix MCQ, True/False, Fill in the Blanks, Scenario, and Coding Interview questions
    - Ensure anti-duplication by checking against previous question history
    """
    def __init__(self, name: str = "Adaptive_Quiz_Agent"):
        self.name = name

    def execute(
        self,
        topic: str,
        summary_text: str = "",
        difficulty: str = "Medium",
        num_questions: int = 15,
        existing_questions: List[str] = None,
        student_profile: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        if existing_questions is None:
            existing_questions = []

        # Auto-adjust difficulty based on Student Learning Profile if provided
        effective_difficulty = difficulty
        profile_style_prompt = ""
        if student_profile:
            speed = student_profile.get("learning_speed", "Medium")
            trend = student_profile.get("improvement_trend", "Stable")
            style = student_profile.get("learning_style", "Mixed")

            if speed == "Fast" or trend == "Fast Learner":
                effective_difficulty = "Hard"
                profile_style_prompt = "Generate HARD, advanced interview-level questions testing edge cases, time/space trade-offs, and complex scenarios."
            elif trend == "Late Bloomer":
                effective_difficulty = "Medium"
                profile_style_prompt = "Generate EASY to MEDIUM progressive questions that encourage steady understanding and build confidence."
            elif speed == "Slow" or trend == "Struggling Learner":
                effective_difficulty = "Easy"
                profile_style_prompt = "Generate ACCESSIBLE, EASY conceptual questions with step-by-step encouraging explanations."
            elif style == "Practice":
                profile_style_prompt = "Focus heavily on real-world scenario-based problem solving and hands-on coding questions."

        logger.info(f"[{self.name}] Generating {num_questions} unique questions for '{topic}' (Adapted Difficulty: {effective_difficulty})")

        existing_set = set(q.strip().lower() for q in existing_questions if q)
        
        system_prompt = "You are an expert AI Adaptive Quiz Master. Output ONLY a valid JSON object containing a 'questions' array with EXACTLY 15 questions."

        avoid_clause = ""
        if existing_set:
            sample_avoid = list(existing_set)[:10]
            avoid_clause = f"\nDO NOT reuse any of these previously asked questions:\n- " + "\n- ".join(sample_avoid)

        prompt = f"""
Generate EXACTLY {num_questions} unique quiz questions for the topic: "{topic}" (Difficulty: {effective_difficulty}).
{profile_style_prompt}

Ensure a balanced mix of:
1. Multiple Choice Questions (MCQs)
2. True/False Questions
3. Fill in the Blanks Questions
4. Real-World Scenario & Interview Problem Solving Questions
{avoid_clause}

For ALL questions, include 4 choices in the "options" array.
Return ONLY a JSON object with this exact structure:
{{
  "questions": [
    {{
      "question": "Question text testing conceptual understanding?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Clear explanation detailing why Option A is correct and why other options are incorrect.",
      "difficulty": "{effective_difficulty}"
    }}
  ]
}}
"""
        res_val = call_groq_llm(prompt, system_prompt, agent_name=self.name)
        response_str, source = res_val if isinstance(res_val, tuple) else (res_val, "REAL_GROQ")
        parsed_questions = []

        if response_str:
            try:
                parsed = json.loads(response_str)
                if isinstance(parsed, dict):
                    questions_list = parsed.get("questions") or parsed.get("data") or parsed.get("quiz")
                    if isinstance(questions_list, list) and len(questions_list) > 0:
                        parsed_questions = questions_list
                elif isinstance(parsed, list) and len(parsed) > 0:
                    parsed_questions = parsed
            except Exception as e:
                logger.error(f"Failed to parse quiz JSON from Groq: {e}")

        # Filter out duplicates
        unique_questions = []
        for q in parsed_questions:
            q_text = q.get("question", "").strip()
            if q_text and q_text.lower() not in existing_set:
                unique_questions.append(q)
                existing_set.add(q_text.lower())

        # If we need more questions to reach 15, generate fallbacks
        if len(unique_questions) < num_questions:
            fallbacks = self._generate_fallback_bank(topic, effective_difficulty)
            for fq in fallbacks:
                if len(unique_questions) >= num_questions:
                    break
                fq_text = fq["question"].strip()
                if fq_text.lower() not in existing_set:
                    unique_questions.append(fq)
                    existing_set.add(fq_text.lower())

        # Randomize question order and options order for fresh experience
        for q in unique_questions:
            opts = q.get("options", [])
            correct_ans = q.get("answer", "")
            if len(opts) == 4 and correct_ans in opts:
                random.shuffle(opts)

        return unique_questions[:num_questions]

    def _generate_fallback_bank(self, topic: str, difficulty: str) -> List[Dict[str, Any]]:
        bank = [
            {
                "question": f"What is the primary operational advantage of implementing {topic}?",
                "options": ["Drastic reduction in execution complexity", "Elimination of memory requirements", "Guaranteed linear scan over raw data", "Automatic hardware acceleration"],
                "answer": "Drastic reduction in execution complexity",
                "explanation": f"{topic} uses structured invariants to optimize runtime execution performance.",
                "difficulty": difficulty
            },
            {
                "question": f"True or False: {topic} requires data or inputs to satisfy prerequisite structural invariants before execution.",
                "options": ["True", "False", "Only in rare cases", "Not applicable"],
                "answer": "True",
                "explanation": f"Most efficient algorithms for {topic} depend on ordered inputs or structural preconditions.",
                "difficulty": difficulty
            },
            {
                "question": f"Which best describes the space complexity of standard iterative {topic}?",
                "options": ["O(1) Auxiliary Space", "O(N^2) Space", "O(2^N) Space", "Unbounded Space"],
                "answer": "O(1) Auxiliary Space",
                "explanation": "Iterative implementations avoid recursive call stack overhead, maintaining constant auxiliary space O(1).",
                "difficulty": difficulty
            },
            {
                "question": f"Fill in the blank: In technical coding interviews, {topic} is frequently tested to evaluate candidate understanding of __________ bounds.",
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
            },
            {
                "question": f"Scenario: A production service experiences latency spikes during peak load using {topic}. What is the most effective optimization?",
                "options": ["Implement caching and optimize boundary checks", "Double server RAM", "Disable all error logging", "Switch to plain text file storage"],
                "answer": "Implement caching and optimize boundary checks",
                "explanation": "Caching repeated results and eliminating redundant boundary checks minimizes CPU execution cycles.",
                "difficulty": difficulty
            },
            {
                "question": f"Which time complexity best represents worst-case performance for unoptimized {topic}?",
                "options": ["O(N^2)", "O(1)", "O(log N)", "O(N log N)"],
                "answer": "O(N^2)",
                "explanation": "Unoptimized nested iterations degrade performance to quadratic time O(N^2).",
                "difficulty": difficulty
            },
            {
                "question": f"True or False: Modern database engines rely heavily on {topic} for index searching and binary lookup algorithms.",
                "options": ["True", "False", "Only on mobile databases", "Deprecated"],
                "answer": "True",
                "explanation": "B-Trees, B+ Trees, and binary search patterns form the backbone of modern database indexing.",
                "difficulty": difficulty
            },
            {
                "question": f"In {topic}, what condition serves as the primary base case to terminate a recursive call stack?",
                "options": ["When search range low index exceeds high index", "When memory reaches 100%", "When CPU temperature spikes", "When 100 seconds elapse"],
                "answer": "When search range low index exceeds high index",
                "explanation": "When low > high, the search range is exhausted and recursion terminates safely.",
                "difficulty": difficulty
            },
            {
                "question": f"Fill in the blank: To prevent integer overflow when calculating mid pointer in {topic}, developers use mid = low + (__________).",
                "options": ["(high - low) / 2", "(high + low) * 2", "(high * low)", "high - 1"],
                "answer": "(high - low) / 2",
                "explanation": "Writing `low + (high - low)/2` guards against integer overflow bugs in large arrays.",
                "difficulty": difficulty
            },
            {
                "question": f"Which data structure is LEAST suited for direct O(1) random index access in {topic}?",
                "options": ["Singly Linked List", "Static Array", "Dynamic Vector", "Memory Buffer"],
                "answer": "Singly Linked List",
                "explanation": "Singly linked lists require O(N) traversal to reach element index K, making binary search inefficient.",
                "difficulty": difficulty
            },
            {
                "question": f"What is the average-case time complexity of binary search operations in {topic}?",
                "options": ["O(log N)", "O(N)", "O(N^2)", "O(1)"],
                "answer": "O(log N)",
                "explanation": "Each comparison halves the remaining search space, yielding logarithmic time O(log N).",
                "difficulty": difficulty
            },
            {
                "question": f"True or False: {topic} principles apply to divide-and-conquer strategy in merge sort and quick select.",
                "options": ["True", "False", "Only in JavaScript", "Never"],
                "answer": "True",
                "explanation": "Halving problems into smaller subproblems is the defining principle of divide-and-conquer algorithms.",
                "difficulty": difficulty
            },
            {
                "question": f"In a competitive coding interview on {topic}, what is the first edge case you should test?",
                "options": ["Empty array and single-element array", "1,000,000 element array", "Negative numbers only", "Strings only"],
                "answer": "Empty array and single-element array",
                "explanation": "Edge cases like empty arrays or single elements ensure boundary stability without index-out-of-bounds crashes.",
                "difficulty": difficulty
            },
            {
                "question": f"What key trade-off must be considered before applying {topic} on dynamic data streams?",
                "options": ["Sorting overhead during frequent insertions vs fast lookup speed", "CPU clock frequency vs monitor resolution", "User interface theme vs color palette", "Network protocol vs DNS latency"],
                "answer": "Sorting overhead during frequent insertions vs fast lookup speed",
                "explanation": "Maintaining sorted order on frequent writes costs O(N), trading insertion speed for logarithmic search speed.",
                "difficulty": difficulty
            }
        ]
        return bank

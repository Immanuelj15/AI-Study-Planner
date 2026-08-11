import json
import logging
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class ResearchAgent:
    """
    Agent 1: Research Agent
    Responsibilities:
    - Receive study topic
    - Search information using LLM
    - Collect concepts, definitions, examples, formulas, interview points
    - Return structured JSON
    """
    def __init__(self, name: str = "Research_Agent"):
        self.name = name

    def execute(self, topic: str, difficulty: str = "Medium") -> dict:
        diff_clean = (difficulty or "Medium").strip().capitalize()
        if diff_clean not in ["Easy", "Medium", "Hard"]:
            diff_clean = "Medium"

        logger.info(f"[{self.name}] Initiating difficulty-aware research on '{topic}' (Level: {diff_clean})")
        
        depth_instruction = "BEGINNER LEVEL: Focus on simple definitions, intuitive analogies, basic building blocks, and introductory examples. Avoid complex mathematical proofs or heavy edge cases."
        if diff_clean == "Medium":
            depth_instruction = "INTERMEDIATE LEVEL: Focus on core algorithms, standard implementation patterns, practical applications, and time/space complexity analysis."
        elif diff_clean == "Hard":
            depth_instruction = "ADVANCED LEVEL: Focus on internal architectural mechanics, lower/upper bound proofs, concurrency invariants, optimization trade-offs, and complex interview-level edge cases."

        system_prompt = (
            "You are an expert AI Academic Research Agent. Output ONLY valid, raw JSON with no markdown wrapping or extra text."
        )
        
        prompt = f"""
Given the study topic: "{topic}" (Difficulty Target: {diff_clean})

Research Depth Directive: {depth_instruction}

Conduct difficulty-tailored academic research and return a JSON object with EXACTLY this structure:
{{
  "topic": "{topic}",
  "difficulty": "{diff_clean}",
  "concepts": ["Concept 1 tailored to {diff_clean}", "Concept 2", "Concept 3", "Concept 4"],
  "definitions": ["Core definition 1 for {diff_clean} level", "Core definition 2"],
  "examples": ["Practical code or scenario example 1", "Practical scenario example 2"],
  "formulas": ["Key formula / equation 1", "Key equation 2"],
  "interview_questions": ["Technical interview question 1 ({diff_clean} level)", "Technical question 2"]
}}
"""
        from services.llm_gateway import LLMGateway
        cache_key = LLMGateway.generate_cache_key(self.name, topic, diff_clean)
        response_str, source = LLMGateway.execute_json(
            agent_name=self.name,
            prompt=prompt,
            system_prompt=system_prompt,
            cache_key=cache_key
        )
        
        if response_str:
            try:
                data = json.loads(response_str)
                data["source"] = source
                return data
            except Exception as e:
                logger.error(f"Failed to parse research JSON from Groq: {e}")

        # High quality fallback mock output
        return {
            "topic": topic,
            "source": "FALLBACK",
            "concepts": [
                f"Fundamental principles of {topic}",
                f"Core structural design & paradigm in {topic}",
                f"Efficiency & optimization patterns",
                f"Real-world application domain"
            ],
            "definitions": [
                f"{topic} is a foundational subject in computer science and engineering focusing on problem solving, performance, and scalability.",
                f"Key mechanism of {topic}: breaking down complex computational tasks into manageable, deterministic logical operations."
            ],
            "examples": [
                f"Standard implementation example for {topic} handling typical edge cases.",
                f"Production scenario where {topic} reduces execution latency from O(N) to logarithmic or constant bounds."
            ],
            "formulas": [
                "Time Complexity: O(log N) or O(N log N)",
                "Space Complexity: O(1) auxiliary memory",
                "Performance ratio: E = T_optimal / T_actual"
            ],
            "interview_questions": [
                f"Question: Explain the main difference between {topic} and basic brute-force approaches.\nAnswer: {topic} leverages structural invariants to cut down search space dramatically.",
                f"Question: How do you optimize memory overhead in {topic}?\nAnswer: By utilizing iterative pointers and avoiding extra recursive call stack allocations."
            ]
        }

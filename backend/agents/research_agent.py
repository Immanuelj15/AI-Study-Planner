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

    def execute(self, topic: str) -> dict:
        logger.info(f"[{self.name}] Initiating research on topic: {topic}")
        
        system_prompt = (
            "You are an expert AI Academic Research Agent. Output ONLY valid, raw JSON with no markdown wrapping or extra text."
        )
        
        prompt = f"""
Given the study topic: "{topic}"

Conduct comprehensive academic research and return a JSON object with EXACTLY this structure:
{{
  "topic": "{topic}",
  "concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "definitions": ["Core definition 1", "Core definition 2"],
  "examples": ["Practical code or scenario example 1", "Practical scenario example 2"],
  "formulas": ["Key formula / algorithm equation 1", "Key equation 2"],
  "interview_questions": ["Key interview question 1 with brief answer", "Key interview question 2 with brief answer"]
}}
"""
        res_val = call_groq_llm(prompt, system_prompt, agent_name=self.name)
        response_str, source = res_val if isinstance(res_val, tuple) else (res_val, "REAL_GROQ")
        
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

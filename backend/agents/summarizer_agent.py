import json
import logging
from typing import Dict, Any, Optional
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class SummarizerAgent:
    """
    Agent 2: Summarizer Agent (Adaptive)
    Responsibilities:
    - Receive research output & student learning profile
    - Tailor note style (Fast Learner -> concise/advanced, Slow -> detailed step-by-step, Visual -> enhanced diagrams)
    - Generate beginner-friendly notes & React Flow compatible mindmap JSON customized to the specific study topic
    """
    def __init__(self, name: str = "Summarizer_Agent"):
        self.name = name

    def execute(self, research_data: Dict[str, Any], student_profile: Optional[Dict[str, Any]] = None, difficulty: str = "Medium") -> Dict[str, Any]:
        topic = research_data.get("topic", "Study Topic")
        diff_clean = (difficulty or research_data.get("difficulty") or "Medium").strip().capitalize()
        if diff_clean not in ["Easy", "Medium", "Hard"]:
            diff_clean = "Medium"

        logger.info(f"[{self.name}] Summarizing research for topic: '{topic}' (Difficulty Target: {diff_clean})")
        
        system_prompt = (
            f"You are an expert AI Educator & Mind Map Generator. "
            f"Generate accurate, topic-specific concepts and explanations tailored ONLY to '{topic}' at the '{diff_clean}' difficulty level. "
            f"Do NOT output generic or irrelevant OS/DB placeholders."
        )

        learning_style = student_profile.get("learning_style", "Mixed") if student_profile else "Mixed"
        learning_speed = student_profile.get("learning_speed", "Medium") if student_profile else "Medium"
        trend = student_profile.get("improvement_trend", "Stable") if student_profile else "Stable"

        diff_directive = "EASY DIFFICULTY: Use simple beginner-friendly vocabulary, clear step-by-step explanations, and fundamental real-world analogies."
        if diff_clean == "Medium":
            diff_directive = "MEDIUM DIFFICULTY: Use standard technical terminology, core computational principles, practical implementation examples, and time/space complexity bounds."
        elif diff_clean == "Hard":
            diff_directive = "HARD DIFFICULTY: Use advanced domain terminology, deep architectural mechanics, concurrency invariants, lower/upper bound trade-offs, and challenging technical interview edge cases."

        style_instruction = f"{diff_directive} "
        if learning_speed == "Fast" or trend == "Fast Learner":
            style_instruction += "Tailor for a FAST LEARNER: High-density notes, concise key takeaways, and advanced architectural edge cases."
        elif learning_speed == "Slow" or trend == "Struggling Learner" or trend == "Late Bloomer":
            style_instruction += "Tailor for a STRUGGLING/SLOW LEARNER: Step-by-step guidance, clear foundational definitions, and supportive explanations."
        elif learning_style == "Visual":
            style_instruction += "Tailor for a VISUAL LEARNER: Rich visual metaphors and clear hierarchical mind map node descriptions."
        elif learning_style == "Practice":
            style_instruction += "Tailor for a PRACTICE LEARNER: Hands-on code snippets, scenario challenges, and practical exercises."

        prompt = f"""
Given research data on "{topic}" (Target Level: {diff_clean}):
{json.dumps(research_data, indent=2)}

Adaptation Directive: {style_instruction}

Create tailored study notes, 4 bullet takeaways, and an educational React Flow mind map JSON specifically explaining "{topic}" at the {diff_clean} level.
For mind map nodes:
- Ensure every sub-node contains a title AND a 1-line accurate concept explanation tailored to "{topic}" at the {diff_clean} level separated by \\n.
- DO NOT use generic OS or DB indexing placeholders unless the topic is actually Operating Systems or Databases.

Return ONLY valid JSON with this EXACT structure:
{{
  "summary": "### Introduction\\nDetailed introduction to {topic}...\\n\\n### Important Concepts\\nConcept details...\\n\\n### Definitions\\nDetailed definitions...\\n\\n### Examples\\nDetailed examples...\\n\\n### Advantages\\nAdvantages list...\\n\\n### Disadvantages\\nDisadvantages list...\\n\\n### Applications\\nApplications text...\\n\\n### Interview Tips\\nInterview tips...\\n\\n### Revision Notes\\nQuick revision summary...",
  "bullet_points": [
    "Key takeaway 1 for {topic}",
    "Key takeaway 2 for {topic}",
    "Key takeaway 3 for {topic}",
    "Key takeaway 4 for {topic}"
  ],
  "mindmap_json": {{
    "nodes": [
      {{ "id": "root", "data": {{ "label": "{topic}" }}, "position": {{ "x": 380, "y": 30 }} }},
      {{ "id": "def", "data": {{ "label": "Core Definition\\nAccurate 1-line definition of {topic}" }}, "position": {{ "x": 80, "y": 170 }} }},
      {{ "id": "concepts", "data": {{ "label": "Key Principles\\nCore mechanisms governing {topic}" }}, "position": {{ "x": 380, "y": 170 }} }},
      {{ "id": "apps", "data": {{ "label": "Real-World Applications\\nHow {topic} is applied in production systems" }}, "position": {{ "x": 680, "y": 170 }} }},
      {{ "id": "math", "data": {{ "label": "Math & Metrics\\nKey equations and complexity bounds for {topic}" }}, "position": {{ "x": 220, "y": 310 }} }},
      {{ "id": "interview", "data": {{ "label": "Interview Takeaway\\nKey technical question & solution for {topic}" }}, "position": {{ "x": 540, "y": 310 }} }}
    ],
    "edges": [
      {{ "id": "e-root-def", "source": "root", "target": "def", "animated": true }},
      {{ "id": "e-root-concepts", "source": "root", "target": "concepts", "animated": true }},
      {{ "id": "e-root-apps", "source": "root", "target": "apps", "animated": true }},
      {{ "id": "e-concepts-math", "source": "concepts", "target": "math", "animated": true }},
      {{ "id": "e-concepts-interview", "source": "concepts", "target": "interview", "animated": true }}
    ]
  }}
}}
"""
        from services.llm_gateway import LLMGateway
        cache_key = LLMGateway.generate_cache_key(self.name, topic, diff_clean, learning_style)
        response_str, source = LLMGateway.execute_json(
            agent_name=self.name,
            prompt=prompt,
            system_prompt=system_prompt,
            cache_key=cache_key
        )
        if response_str:
            try:
                parsed = json.loads(response_str)
                if "summary" in parsed and "mindmap_json" in parsed:
                    parsed["source"] = source
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse summarizer JSON from Groq: {e}")

        return self._generate_fallback(topic, research_data)

    def _generate_fallback(self, topic: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        concepts_list = research_data.get("concepts", [f"Core principles of {topic}"])
        defs_list = research_data.get("definitions", [f"Fundamental definition of {topic}"])
        examples_list = research_data.get("examples", [f"Practical implementation of {topic}"])
        formulas_list = research_data.get("formulas", [f"Performance metrics for {topic}"])
        qa_list = research_data.get("interview_questions", [f"Key technical interview question for {topic}"])

        concepts_str = "\n- ".join(concepts_list)
        defs_str = "\n- ".join(defs_list)
        examples_str = "\n- ".join(examples_list)
        formulas_str = "\n- ".join(formulas_list)
        qa_str = "\n- ".join(qa_list)

        summary_md = f"""# Comprehensive Study Guide: {topic}

### Introduction
{topic} is a core academic and industrial discipline. Understanding its underlying principles enables engineers and students to design performant, robust systems.

### Important Concepts
- {concepts_str}

### Definitions
- {defs_str}

### Practical Examples
- {examples_str}

### Mathematical Principles & Formulas
- {formulas_str}

### Key Applications
- Industrial production deployments and algorithm execution in {topic}.

### Interview Tips
- {qa_str}

### Revision Notes
- Focus on foundational principles, edge case handling, and complexity trade-offs in {topic}.
"""

        bullet_points = [
            f"{topic} provides structured problem-solving paradigms for complex engineering tasks.",
            f"Understanding key invariants in {topic} optimizes computational time and space complexity.",
            f"Frequently evaluated in technical coding interviews and competitive exams.",
            f"Widely adopted across modern software systems, AI pipelines, and data architectures."
        ]

        def_text = defs_list[0] if defs_list else f"Core operational mechanism of {topic}"
        concept_text = concepts_list[0] if concepts_list else f"Fundamental structural principles of {topic}"
        app_text = examples_list[0] if examples_list else f"Real-world production usage of {topic}"
        math_text = formulas_list[0] if formulas_list else f"Time & Space complexity for {topic}"
        interview_text = qa_list[0] if qa_list else f"Top interview question for {topic}"

        # Clean line breaks for mindmap node labels
        def_short = (def_text[:60] + '...') if len(def_text) > 60 else def_text
        concept_short = (concept_text[:60] + '...') if len(concept_text) > 60 else concept_text
        app_short = (app_text[:60] + '...') if len(app_text) > 60 else app_text
        math_short = (math_text[:60] + '...') if len(math_text) > 60 else math_text
        interview_short = (interview_text[:60] + '...') if len(interview_text) > 60 else interview_text

        mindmap = {
            "nodes": [
                {
                    "id": "root",
                    "data": {"label": f"{topic}"},
                    "position": {"x": 380, "y": 30}
                },
                {
                    "id": "def",
                    "data": {"label": f"Core Definition\n{def_short}"},
                    "position": {"x": 80, "y": 170}
                },
                {
                    "id": "concepts",
                    "data": {"label": f"Key Principles\n{concept_short}"},
                    "position": {"x": 380, "y": 170}
                },
                {
                    "id": "apps",
                    "data": {"label": f"Applications\n{app_short}"},
                    "position": {"x": 680, "y": 170}
                },
                {
                    "id": "math",
                    "data": {"label": f"Math & Complexity\n{math_short}"},
                    "position": {"x": 220, "y": 310}
                },
                {
                    "id": "interview",
                    "data": {"label": f"Interview Focus\n{interview_short}"},
                    "position": {"x": 540, "y": 310}
                }
            ],
            "edges": [
                {"id": "e-root-def", "source": "root", "target": "def", "animated": True},
                {"id": "e-root-concepts", "source": "root", "target": "concepts", "animated": True},
                {"id": "e-root-apps", "source": "root", "target": "apps", "animated": True},
                {"id": "e-concepts-math", "source": "concepts", "target": "math", "animated": True},
                {"id": "e-concepts-interview", "source": "concepts", "target": "interview", "animated": True}
            ]
        }

        return {
            "summary": summary_md,
            "bullet_points": bullet_points,
            "mindmap_json": mindmap
        }

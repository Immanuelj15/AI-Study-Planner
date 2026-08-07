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
    - Generate beginner-friendly notes & React Flow compatible mindmap JSON
    """
    def __init__(self, name: str = "Summarizer_Agent"):
        self.name = name

    def execute(self, research_data: Dict[str, Any], student_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        topic = research_data.get("topic", "Study Topic")
        logger.info(f"[{self.name}] Summarizing research for topic: {topic}")
        
        system_prompt = "You are an expert AI Educator & Note Summarizer. Output strictly valid JSON."

        learning_style = student_profile.get("learning_style", "Mixed") if student_profile else "Mixed"
        learning_speed = student_profile.get("learning_speed", "Medium") if student_profile else "Medium"
        trend = student_profile.get("improvement_trend", "Stable") if student_profile else "Stable"

        style_instruction = ""
        if learning_speed == "Fast" or trend == "Fast Learner":
            style_instruction = "Tailor for a FAST LEARNER: Use concise notes, highlight advanced invariants, architectural edge cases, and high-frequency technical interview tips."
        elif learning_speed == "Slow" or trend == "Struggling Learner" or trend == "Late Bloomer":
            style_instruction = "Tailor for a STRUGGLING/SLOW LEARNER: Use step-by-step simple English, clear foundational definitions, multiple real-world analogies, and encouraging guidance."
        elif learning_style == "Visual":
            style_instruction = "Tailor for a VISUAL LEARNER: Generate enhanced mindmap nodes with rich visual metaphors and clear hierarchical connections."
        elif learning_style == "Practice":
            style_instruction = "Tailor for a PRACTICE LEARNER: Provide actionable code examples, hands-on exercises, and scenario challenges."

        prompt = f"""
Given research data on "{topic}":
{json.dumps(research_data, indent=2)}

Adaptation Directive: {style_instruction}

Create tailored study notes and an educational React Flow mind map JSON.
For mind map nodes, ensure every sub-node includes a title AND a 1-line concept explanation separated by \\n.

Return ONLY valid JSON with this EXACT structure:
{{
  "summary": "### Introduction\\nIntroduction text here...\\n\\n### Important Concepts\\nConcept details...\\n\\n### Definitions\\nDetailed definitions...\\n\\n### Examples\\nDetailed examples...\\n\\n### Advantages\\nAdvantages list...\\n\\n### Disadvantages\\nDisadvantages list...\\n\\n### Applications\\nApplications text...\\n\\n### Interview Tips\\nInterview tips...\\n\\n### Revision Notes\\nQuick revision summary...",
  "bullet_points": [
    "Key takeaways 1",
    "Key takeaways 2",
    "Key takeaways 3",
    "Key takeaways 4"
  ],
  "mindmap_json": {{
    "nodes": [
      {{ "id": "root", "data": {{ "label": "🎯 {topic}" }}, "position": {{ "x": 380, "y": 30 }} }},
      {{ "id": "def", "data": {{ "label": "📖 Core Definition\\nDetailed 1-line definition of {topic}" }}, "position": {{ "x": 80, "y": 170 }} }},
      {{ "id": "concepts", "data": {{ "label": "💡 Key Invariants\\nCore principles and rules governing {topic}" }}, "position": {{ "x": 380, "y": 170 }} }},
      {{ "id": "apps", "data": {{ "label": "🚀 Real-World Applications\\nIndustrial use cases in OS and DB indexing" }}, "position": {{ "x": 680, "y": 170 }} }},
      {{ "id": "math", "data": {{ "label": "⚡ Complexity & Math\\nTime: O(log N) | Space: O(1) Auxiliary" }}, "position": {{ "x": 220, "y": 310 }} }},
      {{ "id": "interview", "data": {{ "label": "💼 Interview Key Takeaway\\nEdge cases & overflow prevention" }}, "position": {{ "x": 540, "y": 310 }} }}
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
        response_str = call_groq_llm(prompt, system_prompt)
        if response_str:
            try:
                parsed = json.loads(response_str)
                if "summary" in parsed and "mindmap_json" in parsed:
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse summarizer JSON from Groq: {e}")

        return self._generate_fallback(topic, research_data)

    def _generate_fallback(self, topic: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        concepts_str = "\n- ".join(research_data.get("concepts", ["Core principles", "Structure"]))
        defs_str = "\n- ".join(research_data.get("definitions", ["Fundamental definition"]))
        examples_str = "\n- ".join(research_data.get("examples", ["Standard implementation example"]))
        formulas_str = "\n- ".join(research_data.get("formulas", ["Time/Space equations"]))
        qa_str = "\n- ".join(research_data.get("interview_questions", ["Key interview takeaway"]))

        summary_md = f"""# Comprehensive Study Guide: {topic}

### Introduction
{topic} is a key concept that forms the backbone of modern computer science and engineering problem solving. Understanding its core principles allows developers to write performant, scalable code.

### Important Concepts
- {concepts_str}

### Definitions
- {defs_str}

### Examples
- {examples_str}

### Advantages
- High efficiency and computational speed.
- Predictable space and time complexity bounds.
- Wide industrial applicability in databases and system software.

### Disadvantages
- Requires pre-requisites (e.g. sorted arrays or structural overhead).
- Higher initial implementation complexity compared to basic linear approaches.

### Applications
- Database indexing algorithms (B-Trees, Binary Search Trees).
- Search engines and real-time routing engines.
- Memory management and dynamic memory allocation.

### Interview Tips
- {qa_str}

### Revision Notes
- Remember key complexity formulas: {formulas_str}
- Always double check edge cases like empty inputs, boundary indices, and numerical overflow.
"""

        bullet_points = [
            f"{topic} optimizes processing efficiency from brute force to structured execution.",
            f"Requires key prerequisites to guarantee O(log N) or high performance bounds.",
            f"Essential topic frequently tested in technical coding interviews.",
            f"Applied extensively across database systems, OS kernels, and algorithm design."
        ]

        mindmap = {
            "nodes": [
                {
                    "id": "root",
                    "data": {"label": f"🎯 {topic}"},
                    "position": {"x": 380, "y": 30}
                },
                {
                    "id": "def",
                    "data": {"label": f"📖 Core Definition\nDivide & conquer algorithm for {topic}"},
                    "position": {"x": 80, "y": 170}
                },
                {
                    "id": "concepts",
                    "data": {"label": f"💡 Key Invariants\nCore principles and rules governing {topic}"},
                    "position": {"x": 380, "y": 170}
                },
                {
                    "id": "apps",
                    "data": {"label": f"🚀 Real-World Applications\nIndustrial use cases in OS and DB indexing"},
                    "position": {"x": 680, "y": 170}
                },
                {
                    "id": "math",
                    "data": {"label": f"⚡ Complexity & Math\nTime: O(log N) | Space: O(1) Auxiliary"},
                    "position": {"x": 220, "y": 310}
                },
                {
                    "id": "interview",
                    "data": {"label": f"💼 Interview Key Takeaway\nEdge cases & overflow prevention"},
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

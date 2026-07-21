import json
import logging
from typing import Dict, Any
from services.groq_client import call_groq_llm

logger = logging.getLogger(__name__)

class SummarizerAgent:
    """
    Agent 2: Summarizer Agent
    Responsibilities:
    - Receive research output
    - Convert into beginner-friendly notes (Intro, Concepts, Defs, Examples, Pros, Cons, Applications, Interview Tips, Revision Notes)
    - Generate bullet point summary
    - Generate React Flow compatible mindmap JSON (nodes & edges)
    """
    def __init__(self, name: str = "Summarizer_Agent"):
        self.name = name

    def execute(self, research_data: Dict[str, Any]) -> Dict[str, Any]:
        topic = research_data.get("topic", "Study Topic")
        logger.info(f"[{self.name}] Summarizing research for topic: {topic}")
        
        system_prompt = "You are an expert AI Educator & Note Summarizer. Output strictly valid JSON."
        
        prompt = f"""
Given this research data on "{topic}":
{json.dumps(research_data, indent=2)}

Create comprehensive, beginner-friendly study notes and a React Flow compatible mind map JSON.
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
      {{ "id": "root", "data": {{ "label": "{topic}" }}, "position": {{ "x": 350, "y": 50 }}, "style": {{ "background": "#4f46e5", "color": "#fff", "fontWeight": "bold" }} }},
      {{ "id": "1", "data": {{ "label": "Definition" }}, "position": {{ "x": 100, "y": 180 }} }},
      {{ "id": "2", "data": {{ "label": "Core Concepts" }}, "position": {{ "x": 350, "y": 180 }} }},
      {{ "id": "3", "data": {{ "label": "Applications" }}, "position": {{ "x": 600, "y": 180 }} }},
      {{ "id": "4", "data": {{ "label": "Complexity & Math" }}, "position": {{ "x": 220, "y": 300 }} }},
      {{ "id": "5", "data": {{ "label": "Interview Focus" }}, "position": {{ "x": 480, "y": 300 }} }}
    ],
    "edges": [
      {{ "id": "e-root-1", "source": "root", "target": "1", "animated": true }},
      {{ "id": "e-root-2", "source": "root", "target": "2", "animated": true }},
      {{ "id": "e-root-3", "source": "root", "target": "3", "animated": true }},
      {{ "id": "e-2-4", "source": "2", "target": "4" }},
      {{ "id": "e-2-5", "source": "2", "target": "5" }}
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

        # Fallback generator
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
                    "position": {"x": 320, "y": 40},
                    "style": {"background": "#6366f1", "color": "#ffffff", "borderRadius": "12px", "padding": "12px 20px", "fontWeight": "bold", "fontSize": "16px"}
                },
                {
                    "id": "def",
                    "data": {"label": "📖 Definition"},
                    "position": {"x": 80, "y": 160},
                    "style": {"background": "#1e293b", "color": "#38bdf8", "border": "1px solid #38bdf8", "borderRadius": "8px", "padding": "10px"}
                },
                {
                    "id": "concepts",
                    "data": {"label": "💡 Core Concepts"},
                    "position": {"x": 320, "y": 160},
                    "style": {"background": "#1e293b", "color": "#a855f7", "border": "1px solid #a855f7", "borderRadius": "8px", "padding": "10px"}
                },
                {
                    "id": "apps",
                    "data": {"label": "🚀 Applications"},
                    "position": {"x": 560, "y": 160},
                    "style": {"background": "#1e293b", "color": "#22c55e", "border": "1px solid #22c55e", "borderRadius": "8px", "padding": "10px"}
                },
                {
                    "id": "formulas",
                    "data": {"label": "⚡ Complexity / Math"},
                    "position": {"x": 200, "y": 280},
                    "style": {"background": "#1e293b", "color": "#f59e0b", "border": "1px solid #f59e0b", "borderRadius": "8px", "padding": "10px"}
                },
                {
                    "id": "interview",
                    "data": {"label": "💼 Interview Q&A"},
                    "position": {"x": 440, "y": 280},
                    "style": {"background": "#1e293b", "color": "#ec4899", "border": "1px solid #ec4899", "borderRadius": "8px", "padding": "10px"}
                }
            ],
            "edges": [
                {"id": "e-root-def", "source": "root", "target": "def", "animated": True, "style": {"stroke": "#6366f1"}},
                {"id": "e-root-concepts", "source": "root", "target": "concepts", "animated": True, "style": {"stroke": "#6366f1"}},
                {"id": "e-root-apps", "source": "root", "target": "apps", "animated": True, "style": {"stroke": "#6366f1"}},
                {"id": "e-concepts-formulas", "source": "concepts", "target": "formulas", "style": {"stroke": "#a855f7"}},
                {"id": "e-concepts-interview", "source": "concepts", "target": "interview", "style": {"stroke": "#a855f7"}}
            ]
        }

        return {
            "summary": summary_md,
            "bullet_points": bullet_points,
            "mindmap_json": mindmap
        }

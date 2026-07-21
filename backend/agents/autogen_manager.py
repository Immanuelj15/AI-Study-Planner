import logging
from typing import Dict, Any, List
from agents.research_agent import ResearchAgent
from agents.summarizer_agent import SummarizerAgent
from agents.quiz_agent import QuizAgent
from agents.scheduler_agent import SchedulerAgent

logger = logging.getLogger(__name__)

class AutoGenManager:
    """
    Orchestrates communication across the 4 AutoGen AI Agents:
    1. Research Agent
    2. Summarizer Agent
    3. Quiz Generator Agent
    4. Scheduler Agent
    """
    def __init__(self):
        self.research_agent = ResearchAgent()
        self.summarizer_agent = SummarizerAgent()
        self.quiz_agent = QuizAgent()
        self.scheduler_agent = SchedulerAgent()
        
        # Try initializing Microsoft AutoGen UserProxyAgent / AssistantAgent if available
        try:
            import autogen
            self.autogen_available = True
            logger.info("Microsoft AutoGen framework successfully initialized.")
        except Exception as e:
            self.autogen_available = False
            logger.warning(f"AutoGen default import warning ({e}). Running direct multi-agent pipeline.")

    def run_full_pipeline(self, topic: str, difficulty: str = "Medium") -> Dict[str, Any]:
        """
        Executes end-to-end multi-agent pipeline:
        Research -> Summarize (Notes + Mindmap) -> Quiz Generation
        """
        logger.info(f"--- Launching Multi-Agent Pipeline for Topic: '{topic}' ---")
        
        # Step 1: Research Agent
        research_res = self.research_agent.execute(topic)
        
        # Step 2: Summarizer Agent
        summary_res = self.summarizer_agent.execute(research_res)
        
        # Step 3: Quiz Generator Agent
        quiz_res = self.quiz_agent.execute(
            topic=topic,
            summary_text=summary_res.get("summary", ""),
            difficulty=difficulty,
            num_questions=5
        )
        
        return {
            "topic": topic,
            "research": research_res,
            "summary": summary_res.get("summary", ""),
            "bullet_points": summary_res.get("bullet_points", []),
            "mindmap_json": summary_res.get("mindmap_json", {}),
            "quizzes": quiz_res
        }

autogen_manager = AutoGenManager()

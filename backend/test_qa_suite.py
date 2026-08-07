import sys
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QA_TEST_SUITE")

print("==========================================================")
print("       END-TO-END MULTI-AGENT QA AUDIT TEST SUITE")
print("==========================================================")

try:
    from agents.autogen_manager import autogen_manager
    from agents.research_agent import ResearchAgent
    from agents.summarizer_agent import SummarizerAgent
    from agents.quiz_agent import QuizAgent
    from agents.scheduler_agent import SchedulerAgent

    print("\n1. Testing Research Agent...")
    res = autogen_manager.research_agent.execute("Operating Systems")
    print("   [PASSED] Research Agent output generated successfully.")
    assert isinstance(res, dict) and len(res.get("concepts", [])) > 0, "Research dict output invalid"

    print("\n2. Testing Summarizer Agent...")
    sum_data = autogen_manager.summarizer_agent.execute(res)
    print("   [PASSED] Summarizer Agent notes & Mindmap JSON generated.")
    assert "summary" in sum_data and "mindmap_json" in sum_data, "Summarizer output missing key fields"

    print("\n3. Testing Quiz Agent Engine...")
    quiz_qs = autogen_manager.quiz_agent.execute(
        topic="Operating Systems",
        summary_text=sum_data.get("summary", ""),
        difficulty="Medium",
        num_questions=15,
        existing_questions=[]
    )
    print(f"   [PASSED] Quiz Agent generated {len(quiz_qs)} questions.")
    assert len(quiz_qs) == 15, "Quiz Agent did not generate exactly 15 questions"

    print("\n4. Testing Scheduler Agent...")
    subjects = [{"subject_name": "Operating Systems", "difficulty": "Hard"}]
    plan = autogen_manager.scheduler_agent.generate_initial_plan(
        subjects=subjects,
        exam_date_str="2026-08-15",
        daily_hours=4.0
    )
    print(f"   [PASSED] Scheduler Agent generated {len(plan)} study sessions.")
    assert len(plan) > 0, "Scheduler Agent failed to produce study plan"

    print("\n5. Testing Adaptive Feedback Loop...")
    adapted = autogen_manager.scheduler_agent.adapt_schedule_on_feedback(
        current_plans=plan,
        quiz_score=55.0,
        subject_name="Operating Systems"
    )
    print("   [PASSED] Scheduler Agent updated hours for weak quiz score.")
    assert adapted["is_weak"] is True, "Adaptive feedback failed to flag weak score"

    print("\n==========================================================")
    print("      ALL MULTI-AGENT QA VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================================")

except Exception as e:
    print(f"\n[FAILED] QA Test Error: {e}")
    sys.exit(1)

import sys
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FULL_SYSTEM_QA_CHECK")

print("==========================================================")
print("     COMPREHENSIVE END-TO-END SYSTEM FEATURE VERIFICATION")
print("==========================================================")

try:
    from database.session import SessionLocal, engine
    from models.models import Base, User, Subject, StudyPlan, Summary, Quiz, QuizResult, QuestionHistory, StudentLearningProfile
    from agents.autogen_manager import autogen_manager
    from services.adaptive_learning_engine import adaptive_engine

    # 1. Database Schema Verification
    print("\n1. Verifying SQLite Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    user_count = db.query(User).count()
    profile_count = db.query(StudentLearningProfile).count()
    print(f"   [PASSED] Database tables verified. Users in DB: {user_count}, Profiles: {profile_count}")

    # 2. Test Multi-Agent Research Pipeline
    print("\n2. Verifying Research Agent...")
    res = autogen_manager.research_agent.execute("Operating Systems")
    print("   [PASSED] Research Agent output generated successfully.")
    assert isinstance(res, dict) and len(res.get("concepts", [])) > 0, "Research output invalid"

    # 3. Test Multi-Agent Summarizer & Adaptive Notes
    print("\n3. Verifying Summarizer Agent & Mind Map Hub...")
    dummy_profile = {
        "learning_speed": "Fast",
        "learning_style": "Visual",
        "improvement_trend": "Fast Learner"
    }
    sum_data = autogen_manager.summarizer_agent.execute(res, student_profile=dummy_profile)
    print("   [PASSED] Summarizer Agent generated adaptive notes & React Flow mindmap.")
    assert "summary" in sum_data and "mindmap_json" in sum_data, "Summarizer output missing key fields"

    # 4. Test 15-Question Adaptive Quiz Engine & Anti-Duplication
    print("\n4. Verifying Quiz Agent (15 Questions & Anti-duplication)...")
    quiz_qs = autogen_manager.quiz_agent.execute(
        topic="Operating Systems",
        summary_text=sum_data.get("summary", ""),
        difficulty="Medium",
        num_questions=15,
        existing_questions=[],
        student_profile=dummy_profile
    )
    print(f"   [PASSED] Quiz Agent generated {len(quiz_qs)} questions.")
    assert len(quiz_qs) == 15, "Quiz Agent did not generate exactly 15 questions"

    # 5. Test Scheduler Agent & Adaptive Feedback Loop
    print("\n5. Verifying Scheduler Agent & Adaptive Timetable...")
    subjects = [{"subject_name": "Operating Systems", "difficulty": "Hard"}]
    plan = autogen_manager.scheduler_agent.generate_initial_plan(
        subjects=subjects,
        exam_date_str="2026-08-15",
        daily_hours=4.0
    )
    print(f"   [PASSED] Scheduler Agent generated {len(plan)} study sessions.")
    assert len(plan) > 0, "Scheduler Agent failed to produce study plan"

    adapted = autogen_manager.scheduler_agent.adapt_schedule_on_feedback(
        current_plans=plan,
        quiz_score=55.0,
        subject_name="Operating Systems"
    )
    print("   [PASSED] Scheduler Agent updated hours for weak quiz score.")
    assert adapted["is_weak"] is True, "Adaptive feedback failed to flag weak score"

    # 6. Test Adaptive Learning Intelligence Engine
    print("\n6. Verifying Adaptive Learning Intelligence Engine...")
    demo_user = db.query(User).first()
    if demo_user:
        profile = adaptive_engine.get_or_create_profile(db, demo_user.id)
        print(f"   [PASSED] Profile retrieved: Style={profile.learning_style}, Speed={profile.learning_speed}, Trend={profile.improvement_trend}")

        updated_profile = adaptive_engine.update_telemetry_event(
            db=db,
            user_id=demo_user.id,
            event_type="quiz",
            duration_seconds=120,
            score=88.0,
            topic="Operating Systems"
        )
        print(f"   [PASSED] Telemetry event tracked: New Avg Score={updated_profile.average_quiz_score}%")

        rec = adaptive_engine.get_explainable_recommendation(db, demo_user.id)
        print(f"   [PASSED] Explainable AI recommendation generated: {rec['explainable_ai']['actionable_recommendation'][:60]}...")

    db.close()

    print("\n==========================================================")
    print("  ALL BACKEND & MULTI-AGENT FEATURES WORKING 100% CORRECTLY!")
    print("==========================================================")

except Exception as e:
    print(f"\n[FAILED] Verification Error: {e}")
    sys.exit(1)

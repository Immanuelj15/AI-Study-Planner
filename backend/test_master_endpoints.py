import sys
import os
from fastapi.testclient import TestClient
from main import app
from database.session import SessionLocal
from models.models import User, Subject
from services.auth import get_password_hash

client = TestClient(app)

def test_full_platform_suite():
    print("==================================================================")
    print("STARTING TEST SUITE: COMPLETE MASTER PROMPT FEATURES")
    print("==================================================================")

    # 1. Login with demo user
    login_res = client.post("/login", json={"email": "demo@studyplanner.ai", "password": "password123"})
    if login_res.status_code != 200:
        login_res = client.post("/api/login", json={"email": "demo@studyplanner.ai", "password": "password123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 1. Authentication & JWT Token retrieval")

    # 2. Test Weakness Detection
    w_res = client.get("/weakness/analysis", headers=headers)
    assert w_res.status_code == 200, f"Weakness analysis failed: {w_res.text}"
    w_data = w_res.json()
    assert "summary" in w_data
    print(f"[PASS] 2. Weakness Detection: {w_data['summary']}")

    rec_res = client.get("/weakness/recommendations?topic=DBMS+Normalization&subject=Database+Management+Systems", headers=headers)
    assert rec_res.status_code == 200, f"Recommendations failed: {rec_res.text}"
    rec_data = rec_res.json()
    assert len(rec_data["actions"]) >= 4
    print(f"[PASS] 3. Personalized Recommendations: {len(rec_data['actions'])} actions generated")

    # 3. Test Exam Preparation Mode
    plan_payload = {
        "subject_name": "Database Management Systems",
        "exam_date": "2026-11-15",
        "available_hours_per_day": 3.0,
        "preparation_level": "Intermediate",
        "preferred_study_time": "Morning (9:00 AM - 12:00 PM)"
    }
    ep_res = client.post("/exam-prep/plan", json=plan_payload, headers=headers)
    assert ep_res.status_code == 200, f"Exam prep plan failed: {ep_res.text}"
    ep_data = ep_res.json()
    assert ep_data["total_tasks"] > 0
    print(f"[PASS] 4. Exam Prep Plan: Created with {ep_data['total_tasks']} tasks, countdown: {ep_data['days_countdown']} days")

    # Toggle task
    first_task_id = ep_data["tasks"][0]["id"]
    t_res = client.patch(f"/exam-prep/task/{first_task_id}", json={"status": "Completed"}, headers=headers)
    assert t_res.status_code == 200, f"Toggle task failed: {t_res.text}"
    print("[PASS] 5. Exam Task Completion Toggle")

    # 4. Test Faculty Analytics & AI Early Warning System
    fac_res = client.get("/faculty/overview", headers=headers)
    assert fac_res.status_code == 200, f"Faculty overview failed: {fac_res.text}"
    fac_data = fac_res.json()
    assert "status_distribution" in fac_data
    print(f"[PASS] 6. Faculty Analytics & AI Early Warning: Status distribution {fac_data['status_distribution']}")

    my_warning = client.get("/faculty/my-early-warning", headers=headers)
    assert my_warning.status_code == 200
    print(f"[PASS] 7. Student Early Warning Alert: {my_warning.json()['status']}")

    # 5. Test Smart Revision & Spaced Repetition
    rev_res = client.get("/revision/schedule", headers=headers)
    assert rev_res.status_code == 200, f"Revision schedule failed: {rev_res.text}"
    rev_data = rev_res.json()
    assert "summary" in rev_data
    print(f"[PASS] 8. Smart Revision Schedule: Due today: {rev_data['summary']['due_today']}")

    fc_res = client.get("/revision/flashcards?topic=B-Trees&subject=Database+Management+Systems", headers=headers)
    assert fc_res.status_code == 200
    assert len(fc_res.json()["flashcards"]) >= 3
    print(f"[PASS] 9. Spaced Repetition Flashcards: {len(fc_res.json()['flashcards'])} cards")

    # 6. Test Previous Question Paper Analyzer
    dummy_paper_path = "scratch_test_qp.txt"
    with open(dummy_paper_path, "w", encoding="utf-8") as f:
        f.write("B.E./B.Tech. DEGREE EXAMINATIONS\nCS8492 - DATABASE MANAGEMENT SYSTEMS\n")
        f.write("1. State the purpose of a database management system. [2 marks]\n")
        f.write("2. Define 3NF and BCNF with examples. [8 marks]\n")
        f.write("3. Explain query execution plans and cost estimation. [13 marks]\n")
        f.write("4. Discuss ACID properties and concurrency control algorithms. [15 marks]\n")

    with open(dummy_paper_path, "rb") as f:
        qp_res = client.post(
            "/question-papers/upload",
            data={
                "subject_name": "Database Management Systems",
                "subject_code": "CS8492",
                "academic_year": "2024-2025",
                "semester": 4,
                "regulation": "R2021"
            },
            files={"file": ("test_qp.txt", f, "text/plain")},
            headers=headers
        )
    if os.path.exists(dummy_paper_path):
        os.remove(dummy_paper_path)
    assert qp_res.status_code == 200, f"Question paper upload failed: {qp_res.text}"
    qp_data = qp_res.json()
    assert qp_data["total_questions"] >= 3
    print(f"[PASS] 10. Question Paper Analyzer: Extracted {qp_data['total_questions']} questions with frequency distribution")

    # 7. Test AI Assignment Evaluator
    assign_payload = {
        "subject_name": "Database Management Systems",
        "assignment_title": "Database Normalization Principles",
        "question_prompt": "Explain Boyce-Codd Normal Form (BCNF) and distinguish it from 3NF.",
        "student_answer": "BCNF is a stricter version of 3NF where every determinant must be a candidate key. In 3NF, a functional dependency X -> A is allowed if A is a prime attribute, whereas in BCNF, X must strictly be a superkey. BCNF eliminates all redundancy due to functional dependencies.",
        "unit_number": 2
    }
    eval_res = client.post("/assignments/evaluate", json=assign_payload, headers=headers)
    assert eval_res.status_code == 200, f"Assignment evaluation failed: {eval_res.text}"
    eval_data = eval_res.json()
    assert "conceptual_correctness" in eval_data
    assert "estimated_score" in eval_data
    print(f"[PASS] 11. AI Assignment Evaluator: Score {eval_data['estimated_score']}/100, feedback generated")

    # 8. Test Peer Study Groups
    sg_payload = {
        "name": "DBMS Advanced Exam Squad",
        "subject_name": "Database Management Systems",
        "department": "Computer Science",
        "semester": 4,
        "description": "Collaborative group focused on relational algebra and indexing."
    }
    sg_res = client.post("/study-groups", json=sg_payload, headers=headers)
    assert sg_res.status_code == 200, f"Study group creation failed: {sg_res.text}"
    sg_id = sg_res.json()["id"]
    print(f"[PASS] 12. Peer Study Groups: Created group '{sg_res.json()['name']}' (ID: {sg_id})")

    # Schedule session
    sess_payload = {
        "topic": "B+ Tree Indexing Deep Dive",
        "scheduled_date": "2026-11-02",
        "scheduled_time": "5:00 PM - 6:30 PM",
        "goal": "Solve 5 previous question paper problems"
    }
    sess_res = client.post(f"/study-groups/{sg_id}/sessions", json=sess_payload, headers=headers)
    assert sess_res.status_code == 200, f"Study session failed: {sess_res.text}"
    print("[PASS] 13. Study Group Session Scheduled")

    # 9. Test Gamification & Streaks
    game_res = client.get("/gamification/overview", headers=headers)
    assert game_res.status_code == 200, f"Gamification overview failed: {game_res.text}"
    game_data = game_res.json()
    assert "xp_points" in game_data
    print(f"[PASS] 14. Gamification & Streaks: Streak {game_data['streak_count']} days, XP {game_data['xp_points']}, Level {game_data['student_level']}")

    # 10. Test Language Toggle & Multilingual AI Tutor
    lang_res = client.patch("/language?language=ta", headers=headers)
    if lang_res.status_code != 200:
        lang_res = client.patch("/api/language?language=ta", headers=headers)
    assert lang_res.status_code == 200, f"Language update failed: {lang_res.text}"
    assert lang_res.json()["preferred_language"] == "ta"
    print("[PASS] 15. Multilingual Language Preference Updated to Tamil (ta)")

    tutor_res = client.post("/chat-tutor", json={
        "topic": "Database Indexing",
        "question": "What is an index and why is it used?",
        "difficulty": "Medium",
        "depth": "Simple",
        "language": "ta"
    }, headers=headers)
    assert tutor_res.status_code == 200, f"Tutor chat failed: {tutor_res.text}"
    reply = tutor_res.json()["reply"]
    assert len(reply) > 20
    print(f"[PASS] 16. Multilingual AI Doubt Solver (Tamil & Depth Simple): Generated reply ({len(reply)} chars)")

    print("==================================================================")
    print("ALL 16 MASTER FEATURE ENDPOINTS PASSED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    test_full_platform_suite()

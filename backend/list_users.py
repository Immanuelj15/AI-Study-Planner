import sys
import os
from database.session import SessionLocal
from models.models import User, Subject, StudyPlan, QuizResult

def list_all_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("\n==========================================")
        print(f"       REGISTERED USERS ({len(users)})")
        print("==========================================")
        if not users:
            print("No users found in database.")
            return

        for u in users:
            subjects_count = db.query(Subject).filter(Subject.user_id == u.id).count()
            plans_count = db.query(StudyPlan).filter(StudyPlan.user_id == u.id).count()
            quizzes_count = db.query(QuizResult).filter(QuizResult.user_id == u.id).count()
            print(f"ID: {u.id} | Name: {u.name} | Email: {u.email}")
            print(f"  |- Subjects: {subjects_count} | Study Sessions: {plans_count} | Quizzes Completed: {quizzes_count}\n")
        print("==========================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    list_all_users()

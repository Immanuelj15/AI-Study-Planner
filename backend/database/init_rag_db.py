import logging
from sqlalchemy import text
from database.session import engine
from database.base import Base
import models.models # ensure models are registered

logger = logging.getLogger("RAG_DB_Init")

def init_rag_tables():
    """Safely initialize RAG tables and migrate user columns if missing."""
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        # Check users table columns in SQLite
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result.fetchall()]

        migrations = [
            ("role", "TEXT DEFAULT 'Student'"),
            ("college_id", "TEXT DEFAULT 'College_Main'"),
            ("department", "TEXT DEFAULT 'Computer Science'"),
            ("semester", "INTEGER DEFAULT 1"),
            ("section", "TEXT DEFAULT 'A'"),
            ("preferred_language", "TEXT DEFAULT 'en'"),
            ("streak_count", "INTEGER DEFAULT 1"),
            ("longest_streak", "INTEGER DEFAULT 1"),
            ("last_active_date", "TEXT DEFAULT ''"),
            ("xp_points", "INTEGER DEFAULT 100")
        ]

        for col_name, col_def in migrations:
            if col_name not in columns:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                    conn.commit()
                    logger.info(f"Added missing column '{col_name}' to 'users' table.")
                except Exception as e:
                    logger.warning(f"Column migration notice for {col_name}: {e}")

        # Check rag_documents columns
        doc_result = conn.execute(text("PRAGMA table_info(rag_documents)"))
        doc_columns = [row[1] for row in doc_result.fetchall()]
        doc_migrations = [
            ("subject_code", "TEXT DEFAULT ''"),
            ("regulation", "TEXT DEFAULT 'R2021'")
        ]
        for col_name, col_def in doc_migrations:
            if col_name not in doc_columns:
                try:
                    conn.execute(text(f"ALTER TABLE rag_documents ADD COLUMN {col_name} {col_def}"))
                    conn.commit()
                    logger.info(f"Added missing column '{col_name}' to 'rag_documents' table.")
                except Exception as e:
                    logger.warning(f"Column migration notice for {col_name}: {e}")

if __name__ == "__main__":
    init_rag_tables()
    print("RAG database tables and column migrations completed successfully.")

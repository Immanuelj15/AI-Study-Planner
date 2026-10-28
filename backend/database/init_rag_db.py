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
            ("semester", "INTEGER DEFAULT 1")
        ]

        for col_name, col_def in migrations:
            if col_name not in columns:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                    conn.commit()
                    logger.info(f"Added missing column '{col_name}' to 'users' table.")
                except Exception as e:
                    logger.warning(f"Column migration notice for {col_name}: {e}")

if __name__ == "__main__":
    init_rag_tables()
    print("RAG database tables and column migrations completed successfully.")

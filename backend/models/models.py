import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    learning_profile = relationship("StudentLearningProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")
    ai_logs = relationship("AIUsageLog", backref="user", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_name = Column(String(150), nullable=False)
    difficulty = Column(String(50), default="Medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="subjects")
    study_plans = relationship("StudyPlan", back_populates="subject", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="subject", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="subject", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="subject", cascade="all, delete-orphan")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    study_date = Column(String(50), nullable=False)
    topic = Column(String(200), nullable=False, default="General Review")
    hours = Column(Float, default=1.0)
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="study_plans")
    subject = relationship("Subject", back_populates="study_plans")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    bullet_points = Column(Text, nullable=True) # JSON array stored as string
    mindmap_json = Column(Text, nullable=True)  # JSON string compatible with React Flow
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subject = relationship("Subject", back_populates="summaries")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=True) # JSON array of options stored as string
    answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subject = relationship("Subject", back_populates="quizzes")
    quiz_results = relationship("QuizResult", back_populates="quiz")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    score = Column(Float, nullable=False)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    weak_topics_json = Column(Text, nullable=True) # JSON array stored as string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")
    subject = relationship("Subject", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="quiz_results")


class QuestionHistory(Base):
    __tablename__ = "question_history"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(200), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Medium")
    attempt_number = Column(Integer, default=1)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_used = Column(Integer, default=1)


class StudentLearningProfile(Base):
    __tablename__ = "student_learning_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    learning_speed = Column(String(50), default="Medium")      # Fast, Medium, Slow
    learning_style = Column(String(50), default="Mixed")       # Visual, Reading, Practice, Mixed
    understanding_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced
    confidence_level = Column(String(50), default="Medium")     # Low, Medium, High
    average_reading_time = Column(Float, default=120.0)         # Average reading time in seconds
    average_quiz_time = Column(Float, default=180.0)            # Average quiz time in seconds
    average_quiz_score = Column(Float, default=75.0)             # Average quiz score %
    mindmap_usage = Column(Integer, default=0)                   # Mindmap view count
    revision_frequency = Column(Integer, default=0)              # Revisions count
    chat_usage = Column(Integer, default=0)                      # AI Tutor chat count
    consistency_score = Column(Float, default=85.0)             # Consistency %
    improvement_trend = Column(String(50), default="Stable")     # Late Bloomer, Fast Learner, Struggling Learner, Stable
    preferred_study_time = Column(String(100), default="Morning (9:00 AM - 11:30 AM)")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="learning_profile")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_name = Column(String(150), nullable=False, default="General Study")
    topic = Column(String(200), nullable=False, default="General Review")
    planned_duration_minutes = Column(Integer, default=25)
    actual_duration_seconds = Column(Integer, default=0)
    tab_switch_count = Column(Integer, default=0)
    blur_count = Column(Integer, default=0)
    fullscreen_exit_count = Column(Integer, default=0)
    total_interruption_count = Column(Integer, default=0)
    completed = Column(Integer, default=0) # 0 for false, 1 for true
    session_status = Column(String(50), default="NOT_STARTED") # NOT_STARTED, FOCUS_ACTIVE, PAUSED_TAB_SWITCH, PAUSED_WINDOW_BLUR, PAUSED_FULLSCREEN_EXIT, COMPLETED, CANCELLED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="focus_sessions")


class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    model = Column(String(100), default="llama-3.3-70b-versatile")
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    response_time_ms = Column(Float, default=0.0)
    status = Column(String(50), default="200 OK")
    source = Column(String(50), default="REAL_GROQ") # REAL_GROQ, CACHE, FALLBACK
    fallback_used = Column(Integer, default=0) # 0 for false, 1 for true
    cached = Column(Integer, default=0) # 0 for false, 1 for true
    error_type = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class AICache(Base):
    __tablename__ = "ai_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(255), unique=True, index=True, nullable=False)
    agent_name = Column(String(100), nullable=False, index=True)
    content_type = Column(String(50), default="json")
    response_data = Column(Text, nullable=False)
    model = Column(String(100), default="llama-3.3-70b-versatile")
    prompt_version = Column(String(50), default="v1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_accessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    hit_count = Column(Integer, default=0)


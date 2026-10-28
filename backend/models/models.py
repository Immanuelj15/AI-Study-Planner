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
    role = Column(String(50), default="Student") # Student, Faculty, College Admin, Platform Admin
    college_id = Column(String(100), default="College_Main", index=True)
    department = Column(String(100), default="Computer Science")
    semester = Column(Integer, default=1)
    section = Column(String(50), default="A")
    preferred_language = Column(String(10), default="en") # en, ta
    streak_count = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_active_date = Column(String(20), default=lambda: datetime.datetime.utcnow().strftime("%Y-%m-%d"))
    xp_points = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    learning_profile = relationship("StudentLearningProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")
    ai_logs = relationship("AIUsageLog", backref="user", cascade="all, delete-orphan")
    rag_documents = relationship("RAGDocument", back_populates="owner", cascade="all, delete-orphan")
    rag_queries = relationship("RAGQueryLog", back_populates="user", cascade="all, delete-orphan")
    topic_masteries = relationship("TopicMastery", back_populates="user", cascade="all, delete-orphan")
    exam_plans = relationship("ExamPrepPlan", back_populates="user", cascade="all, delete-orphan")
    repetition_schedules = relationship("SpacedRepetitionSchedule", back_populates="user", cascade="all, delete-orphan")
    assignments = relationship("AssignmentSubmission", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("StudentAchievement", back_populates="user", cascade="all, delete-orphan")


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


class RAGDocument(Base):
    __tablename__ = "rag_documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(64), unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    college_id = Column(String(100), nullable=False, index=True)
    department = Column(String(100), nullable=True)
    course_name = Column(String(150), nullable=True)
    semester = Column(Integer, nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    subject_name = Column(String(150), nullable=False, index=True)
    subject_code = Column(String(50), nullable=True)
    regulation = Column(String(50), nullable=True, default="R2021")
    unit_number = Column(Integer, nullable=True)
    academic_year = Column(String(50), nullable=True)
    document_type = Column(String(100), default="Syllabus") # Syllabus, Subject Notes, Unit Material, Question Paper, Faculty Resource
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    processing_status = Column(String(50), default="Uploaded", index=True) # Uploaded, Processing, Ready, Failed
    error_message = Column(Text, nullable=True)
    total_chunks = Column(Integer, default=0)
    is_official = Column(Integer, default=0) # 1 if uploaded by Faculty/Admin, 0 if personal Student upload
    is_scanned_pdf = Column(Integer, default=0)
    ocr_applied = Column(Integer, default=0)

    owner = relationship("User", back_populates="rag_documents")
    subject = relationship("Subject")


class RAGQueryLog(Base):
    __tablename__ = "rag_query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    college_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False)
    unit_number = Column(Integer, nullable=True)
    difficulty = Column(String(50), default="Medium")
    query_text = Column(Text, nullable=False)
    retrieved_chunks_count = Column(Integer, default=0)
    response_text = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True) # JSON array of citations
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="rag_queries")


class TopicMastery(Base):
    __tablename__ = "topic_masteries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False, index=True)
    topic_name = Column(String(200), nullable=False, index=True)
    unit_number = Column(Integer, nullable=True)
    mastery_score = Column(Float, default=70.0) # 0.0 to 100.0
    total_attempts = Column(Integer, default=1)
    correct_attempts = Column(Integer, default=1)
    status = Column(String(50), default="Needs Revision") # Strong, Weak, Needs Revision, Unassessed
    last_attempted_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="topic_masteries")


class ExamPrepPlan(Base):
    __tablename__ = "exam_prep_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False)
    exam_date = Column(DateTime, nullable=False)
    available_hours_per_day = Column(Float, default=3.0)
    preparation_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced
    preferred_study_time = Column(String(100), default="Morning (9:00 AM - 12:00 PM)")
    total_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="exam_plans")
    tasks = relationship("ExamPrepTask", back_populates="plan", cascade="all, delete-orphan")


class ExamPrepTask(Base):
    __tablename__ = "exam_prep_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("exam_prep_plans.id"), nullable=False, index=True)
    unit_number = Column(Integer, nullable=True)
    topic = Column(String(200), nullable=False)
    study_date = Column(String(50), nullable=False)
    allocated_hours = Column(Float, default=1.5)
    task_type = Column(String(50), default="Learn") # Learn, Quiz, Revision, Mock Exam
    status = Column(String(50), default="Pending") # Pending, Completed, Rescheduled
    priority = Column(String(50), default="High") # High, Medium, Low
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    plan = relationship("ExamPrepPlan", back_populates="tasks")


class SpacedRepetitionSchedule(Base):
    __tablename__ = "spaced_repetition_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False)
    topic = Column(String(200), nullable=False)
    unit_number = Column(Integer, nullable=True)
    interval_stage = Column(Integer, default=1) # 1=Day 1, 2=Day 3, 3=Day 7, 4=Day 14
    last_reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)
    next_review_date = Column(String(50), nullable=False) # YYYY-MM-DD
    repetition_count = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)
    status = Column(String(50), default="Due") # Scheduled, Due, Completed, Overdue
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="repetition_schedules")


class QuestionPaper(Base):
    __tablename__ = "question_papers"

    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    college_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False, index=True)
    subject_code = Column(String(50), nullable=True)
    academic_year = Column(String(50), default="2024-2025")
    semester = Column(Integer, default=3)
    regulation = Column(String(50), default="R2021")
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_questions_json = Column(Text, nullable=True) # JSON array of questions
    topic_frequency_json = Column(Text, nullable=True) # JSON mapping topic -> count
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False)
    unit_number = Column(Integer, nullable=True)
    assignment_title = Column(String(200), nullable=False)
    question_prompt = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    rubric = Column(Text, nullable=True)
    conceptual_correctness = Column(Text, nullable=True)
    key_points_covered = Column(Text, nullable=True)
    missing_concepts = Column(Text, nullable=True)
    clarity_feedback = Column(Text, nullable=True)
    suggested_improvements = Column(Text, nullable=True)
    estimated_score = Column(Float, default=80.0)
    status = Column(String(50), default="Evaluated")
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assignments")


class StudyGroup(Base):
    __tablename__ = "study_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    college_id = Column(String(100), nullable=False, index=True)
    department = Column(String(100), nullable=True)
    subject_name = Column(String(150), nullable=False, index=True)
    semester = Column(Integer, default=3)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    members = relationship("StudyGroupMember", back_populates="group", cascade="all, delete-orphan")
    sessions = relationship("StudyGroupSession", back_populates="group", cascade="all, delete-orphan")


class StudyGroupMember(Base):
    __tablename__ = "study_group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("study_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(50), default="Member") # Admin, Member
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("StudyGroup", back_populates="members")
    user = relationship("User")


class StudyGroupSession(Base):
    __tablename__ = "study_group_sessions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("study_groups.id"), nullable=False, index=True)
    topic = Column(String(200), nullable=False)
    scheduled_date = Column(String(50), nullable=False)
    scheduled_time = Column(String(50), nullable=False)
    goal = Column(Text, nullable=True)
    status = Column(String(50), default="Scheduled") # Scheduled, Completed

    group = relationship("StudyGroup", back_populates="sessions")


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(String(50), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="Award")
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="achievements")


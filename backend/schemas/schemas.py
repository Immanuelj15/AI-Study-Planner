from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Subject Schemas ---
class SubjectCreate(BaseModel):
    subject_name: str
    difficulty: Optional[str] = "Medium"

class SubjectResponse(BaseModel):
    id: int
    user_id: int
    subject_name: str
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Tutor Chat Schemas ---
class ChatTutorRequest(BaseModel):
    topic: str
    question: str
    difficulty: Optional[str] = "Medium"

class ChatTutorResponse(BaseModel):
    reply: str


# --- Study Plan Schemas ---
class PlanGenerationRequest(BaseModel):
    exam_date: str
    daily_hours: float
    subjects: List[str]
    difficulty: Optional[str] = "Medium"

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    subject_id: int
    subject_name: Optional[str] = None
    study_date: str
    topic: str
    hours: float
    priority: str
    status: str

    class Config:
        from_attributes = True


# --- Multi-Agent Schemas ---
class ResearchRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "Medium"

class ResearchOutput(BaseModel):
    topic: str
    concepts: List[str]
    definitions: List[str]
    examples: List[str]
    formulas: List[str]
    interview_questions: List[str]

class SummarizeRequest(BaseModel):
    subject_id: int
    topic: str
    research_content: Optional[Dict[str, Any]] = None
    difficulty: Optional[str] = "Medium"

class SummaryResponse(BaseModel):
    id: Optional[int] = None
    subject_id: int
    topic: str
    summary: str
    bullet_points: List[str]
    mindmap_json: Dict[str, Any]


class QuizGenerationRequest(BaseModel):
    subject_id: int
    topic: str
    summary_text: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    num_questions: Optional[int] = 15

class QuizItem(BaseModel):
    id: Optional[int] = None
    question: str
    options: List[str]
    answer: str
    explanation: str
    difficulty: str

class QuizSubmissionRequest(BaseModel):
    subject_id: int
    score: float
    total_questions: int
    correct_count: int
    wrong_count: int
    answers: List[Dict[str, Any]] # question_id / index, user_answer, is_correct, topic

class QuizResultResponse(BaseModel):
    id: int
    user_id: int
    subject_id: int
    score: float
    correct_answers: int
    wrong_answers: int
    weak_topics: List[str]
    updated_schedule_summary: Optional[str] = None


# --- Dashboard & Analytics Schemas ---
class DashboardMetrics(BaseModel):
    upcoming_exam_days: int
    today_study_hours: float
    completion_percentage: float
    study_streak_days: int
    weak_subjects: List[str]
    strong_subjects: List[str]
    today_plan: List[Dict[str, Any]]
    weekly_progress: List[Dict[str, Any]]
    quiz_performance: Dict[str, Any]


# --- Adaptive Learning Intelligence Engine Schemas ---
class StudentLearningProfileResponse(BaseModel):
    id: int
    user_id: int
    learning_speed: str
    learning_style: str
    understanding_level: str
    confidence_level: str
    average_reading_time: float
    average_quiz_time: float
    average_quiz_score: float
    mindmap_usage: int
    revision_frequency: int
    chat_usage: int
    consistency_score: float
    improvement_trend: str
    preferred_study_time: str
    last_updated: datetime

    class Config:
        from_attributes = True

class TelemetryEventRequest(BaseModel):
    event_type: str  # "reading", "quiz", "mindmap", "chat", "revision"
    duration_seconds: Optional[float] = 0.0
    score: Optional[float] = None
    topic: Optional[str] = None


# --- Focus Mode Schemas ---
class FocusSessionStartRequest(BaseModel):
    subject_name: Optional[str] = "General Study"
    topic: Optional[str] = "General Review"
    planned_duration_minutes: Optional[int] = 25

class FocusSessionInterruptionRequest(BaseModel):
    interruption_type: str  # "tab_switch", "blur", "fullscreen_exit"

class FocusSessionCompleteRequest(BaseModel):
    actual_duration_seconds: int
    completed: Optional[bool] = True

class FocusSessionResponse(BaseModel):
    id: int
    user_id: int
    subject_name: str
    topic: str
    planned_duration_minutes: int
    actual_duration_seconds: int
    tab_switch_count: int
    blur_count: int
    fullscreen_exit_count: int
    total_interruption_count: int
    completed: bool
    session_status: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


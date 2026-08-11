import os
import json
import time
import hashlib
import logging
from datetime import datetime, timedelta
from config import settings
from database.session import SessionLocal
from models.models import AIUsageLog

logger = logging.getLogger(__name__)

# --- Smart In-Memory Caching System ---
# Cache stores: hash_key -> { "response": content, "timestamp": epoch_seconds }
AI_RESPONSE_CACHE = {}
CACHE_TTL_SECONDS = getattr(settings, 'CACHE_TTL_HOURS', 24) * 3600
GROQ_DAILY_TOKEN_BUDGET = getattr(settings, 'GROQ_DAILY_TOKEN_BUDGET', 100000)

def _get_cache_key(prompt: str, system_prompt: str, model: str) -> str:
    raw = f"{model}:{system_prompt.strip()}:{prompt.strip()}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def _log_ai_usage(agent_name: str, model: str, prompt_tokens: int, completion_tokens: int, total_tokens: int, response_time_ms: float, status: str, source: str, fallback_used: int, cached: int, error_type: str = None, user_id: int = None):
    try:
        db = SessionLocal()
        log_entry = AIUsageLog(
            user_id=user_id,
            agent_name=agent_name,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            response_time_ms=response_time_ms,
            status=status,
            source=source,
            fallback_used=fallback_used,
            cached=cached,
            error_type=error_type,
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.close()
    except Exception as e:
        logger.warning(f"Failed to persist AIUsageLog to SQLite: {e}")

def get_today_token_usage() -> int:
    try:
        db = SessionLocal()
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        logs = db.query(AIUsageLog).filter(AIUsageLog.created_at >= today_start).all()
        total = sum(l.total_tokens or 0 for l in logs)
        db.close()
        return total
    except Exception:
        return 0

from services.llm_gateway import LLMGateway

def call_groq_llm(prompt: str, system_prompt: str = "You are an expert AI tutor and study planner.", agent_name: str = "Agent", user_id: int = None) -> tuple[str, str]:
    """
    Delegates JSON requests to the centralized production LLMGateway.
    """
    return LLMGateway.execute_json(agent_name=agent_name, prompt=prompt, system_prompt=system_prompt, user_id=user_id)


def generate_text(prompt: str, system_prompt: str = "You are an expert AI Study Tutor.", agent_name: str = "AI_Tutor", user_id: int = None) -> tuple[str, str]:
    """
    Delegates text Q&A requests to the centralized production LLMGateway.
    """
    return LLMGateway.execute_text(agent_name=agent_name, prompt=prompt, system_prompt=system_prompt, user_id=user_id)

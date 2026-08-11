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

def call_groq_llm(prompt: str, system_prompt: str = "You are an expert AI tutor and study planner.", agent_name: str = "Agent", user_id: int = None) -> tuple[str, str]:
    """
    Calls Groq API with caching, budget checking, token tracking, and smart fallback.
    Returns tuple: (content_string, source_attribution) where source is 'REAL_GROQ', 'CACHE', or 'FALLBACK'.
    """
    model_name = "llama-3.3-70b-versatile"
    cache_key = _get_cache_key(prompt, system_prompt, model_name)
    now = time.time()

    # 1. Check Smart Cache Hit
    if cache_key in AI_RESPONSE_CACHE:
        item = AI_RESPONSE_CACHE[cache_key]
        if now - item["timestamp"] < CACHE_TTL_SECONDS:
            logger.info(f"[{agent_name}] Cache Hit! Reusing cached LLM response.")
            _log_ai_usage(agent_name, model_name, 0, 0, 0, 1.0, "200 OK (CACHED)", "CACHE", 0, 1, user_id=user_id)
            return item["response"], "CACHE"

    # 2. Check Daily Token Budget
    tokens_used_today = get_today_token_usage()
    if tokens_used_today >= GROQ_DAILY_TOKEN_BUDGET:
        logger.warning(f"[{agent_name}] TOKEN_BUDGET_EXCEEDED ({tokens_used_today}/{GROQ_DAILY_TOKEN_BUDGET}). Using safe fallback.")
        _log_ai_usage(agent_name, model_name, 0, 0, 0, 0.0, "BUDGET_EXCEEDED", "FALLBACK", 1, 0, error_type="Rate limit budget reached", user_id=user_id)
        return "", "FALLBACK"

    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

    if api_key and not api_key.startswith("gsk_demo"):
        start_time = time.time()
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"}
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            raw_content = completion.choices[0].message.content or ""
            content = raw_content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            clean_content = content.strip()

            # Record Usage Metadata
            usage = getattr(completion, 'usage', None)
            p_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
            c_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0
            t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else 0

            # Store in Cache
            AI_RESPONSE_CACHE[cache_key] = {"response": clean_content, "timestamp": now}
            _log_ai_usage(agent_name, model_name, p_tokens, c_tokens, t_tokens, elapsed_ms, "200 OK", "REAL_GROQ", 0, 0, user_id=user_id)

            return clean_content, "REAL_GROQ"

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            err_msg = str(e)
            status_code = "429 RATE_LIMIT" if "429" in err_msg or "rate_limit" in err_msg.lower() else "API_ERROR"
            logger.warning(f"[{agent_name}] Groq LLM call error ({err_msg}). Falling back to smart mock engine.")
            _log_ai_usage(agent_name, model_name, 0, 0, 0, elapsed_ms, status_code, "FALLBACK", 1, 0, error_type=err_msg[:200], user_id=user_id)

    # 3. Fallback Engine
    logger.info(f"[{agent_name}] Using smart mock fallback for response generation.")
    return "", "FALLBACK"


def generate_text(prompt: str, system_prompt: str = "You are an expert AI Study Tutor.", agent_name: str = "AI_Tutor", user_id: int = None) -> tuple[str, str]:
    """
    Generate plain-text response using Groq LLM API with caching, token logging, and smart fallback.
    Returns tuple: (text_reply, source_attribution)
    """
    model_name = "llama-3.3-70b-versatile"
    cache_key = _get_cache_key(prompt, system_prompt, model_name)
    now = time.time()

    if cache_key in AI_RESPONSE_CACHE:
        item = AI_RESPONSE_CACHE[cache_key]
        if now - item["timestamp"] < CACHE_TTL_SECONDS:
            _log_ai_usage(agent_name, model_name, 0, 0, 0, 1.0, "200 OK (CACHED)", "CACHE", 0, 1, user_id=user_id)
            return item["response"], "CACHE"

    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

    if api_key and not api_key.startswith("gsk_demo"):
        start_time = time.time()
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            raw_content = completion.choices[0].message.content or ""
            clean_text = raw_content.strip()

            usage = getattr(completion, 'usage', None)
            p_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
            c_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0
            t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else 0

            AI_RESPONSE_CACHE[cache_key] = {"response": clean_text, "timestamp": now}
            _log_ai_usage(agent_name, model_name, p_tokens, c_tokens, t_tokens, elapsed_ms, "200 OK", "REAL_GROQ", 0, 0, user_id=user_id)

            return clean_text, "REAL_GROQ"

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            err_msg = str(e)
            status_code = "429 RATE_LIMIT" if "429" in err_msg or "rate_limit" in err_msg.lower() else "API_ERROR"
            logger.warning(f"[{agent_name}] Groq API text call failed ({err_msg}). Using smart fallback.")
            _log_ai_usage(agent_name, model_name, 0, 0, 0, elapsed_ms, status_code, "FALLBACK", 1, 0, error_type=err_msg[:200], user_id=user_id)

    return "", "FALLBACK"

import os
import json
import time
import random
import hashlib
import logging
from datetime import datetime, timedelta
from config import settings
from database.session import SessionLocal
from models.models import AIUsageLog, AICache

logger = logging.getLogger(__name__)

# --- CONFIGURATION TOKENS & TTL ---
PROMPT_VERSION = "v1"
MODEL_NAME = "llama-3.3-70b-versatile"
CACHE_TTL_HOURS = getattr(settings, 'CACHE_TTL_HOURS', 24)
GROQ_DAILY_TOKEN_BUDGET = getattr(settings, 'GROQ_DAILY_TOKEN_BUDGET', 100000)

class LLMGateway:
    """
    Centralized Production LLM Gateway for Multi-Agent Study Planner.
    Handles: Caching (DB), Token Monitoring, Rate Limits (429), Transient Retries, Usage Logging.
    """
    
    @staticmethod
    def generate_cache_key(agent_name: str, topic: str, difficulty: str = "Medium", extra_params: str = "") -> str:
        raw = f"{MODEL_NAME}:{PROMPT_VERSION}:{agent_name.lower()}:{topic.strip().lower()}:{difficulty.lower()}:{extra_params}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    @classmethod
    def get_cached_response(cls, cache_key: str) -> tuple[str, bool]:
        """Check DB cache for unexpired valid response."""
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            cache_item = db.query(AICache).filter(
                AICache.cache_key == cache_key,
                AICache.expires_at > now
            ).first()

            if cache_item:
                cache_item.hit_count += 1
                cache_item.last_accessed_at = now
                response_content = cache_item.response_data
                db.commit()
                db.close()
                return response_content, True
            db.close()
        except Exception as e:
            logger.warning(f"DB Cache Lookup Error: {e}")
        return "", False

    @classmethod
    def save_to_cache(cls, cache_key: str, agent_name: str, response_data: str, content_type: str = "json"):
        """Save AI response to DB cache with TTL."""
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            expires_at = now + timedelta(hours=CACHE_TTL_HOURS)
            
            # Check existing entry
            existing = db.query(AICache).filter(AICache.cache_key == cache_key).first()
            if existing:
                existing.response_data = response_data
                existing.expires_at = expires_at
                existing.last_accessed_at = now
            else:
                new_cache = AICache(
                    cache_key=cache_key,
                    agent_name=agent_name,
                    content_type=content_type,
                    response_data=response_data,
                    model=MODEL_NAME,
                    prompt_version=PROMPT_VERSION,
                    created_at=now,
                    expires_at=expires_at,
                    last_accessed_at=now,
                    hit_count=0
                )
                db.add(new_cache)
            db.commit()
            db.close()
        except Exception as e:
            logger.warning(f"DB Cache Save Error: {e}")

    @classmethod
    def get_today_tokens_used(cls) -> int:
        """Calculate total tokens used today from SQLite ai_usage_logs."""
        try:
            db = SessionLocal()
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            logs = db.query(AIUsageLog).filter(AIUsageLog.created_at >= today_start).all()
            total = sum(l.total_tokens or 0 for l in logs)
            db.close()
            return total
        except Exception:
            return 0

    @classmethod
    def log_usage(cls, agent_name: str, prompt_tokens: int, completion_tokens: int, total_tokens: int, response_time_ms: float, status: str, source: str, fallback_used: int, cached: int, error_type: str = None, user_id: int = None):
        try:
            db = SessionLocal()
            log_entry = AIUsageLog(
                user_id=user_id,
                agent_name=agent_name,
                model=MODEL_NAME,
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
            logger.warning(f"Usage Log Error: {e}")

    @classmethod
    def execute_json(cls, agent_name: str, prompt: str, system_prompt: str, cache_key: str = None, user_id: int = None) -> tuple[str, str]:
        """
        Executes JSON LLM call through Gateway with Caching, Token Budget, 429 Awareness & Retries.
        Returns: (json_content_string, source_attribution) -> source: 'REAL_GROQ', 'CACHE', 'FALLBACK'
        """
        start_time = time.time()

        # 1. Check Cache
        if cache_key:
            cached_data, is_hit = cls.get_cached_response(cache_key)
            if is_hit:
                logger.info(f"[{agent_name}] 🔵 LLM Gateway: Cache Hit! Returning cached JSON.")
                cls.log_usage(agent_name, 0, 0, 0, 1.0, "200 OK (CACHED)", "CACHE", 0, 1, user_id=user_id)
                return cached_data, "CACHE"

        # 2. Check Token Budget
        today_tokens = cls.get_today_tokens_used()
        if today_tokens >= GROQ_DAILY_TOKEN_BUDGET:
            logger.warning(f"[{agent_name}] 🟡 LLM Gateway: TOKEN_BUDGET_EXCEEDED ({today_tokens}/{GROQ_DAILY_TOKEN_BUDGET}). Using fallback.")
            cls.log_usage(agent_name, 0, 0, 0, 0.0, "BUDGET_EXCEEDED", "FALLBACK", 1, 0, error_type="Application token budget exhausted", user_id=user_id)
            return "", "FALLBACK"

        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
        if not api_key or api_key.startswith("gsk_demo"):
            logger.info(f"[{agent_name}] 🟡 LLM Gateway: API key demo mode. Using fallback.")
            return "", "FALLBACK"

        # 3. Call Groq with Transient Retry Logic (Max 2 retries)
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                from groq import Groq
                client = Groq(api_key=api_key)
                completion = client.chat.completions.create(
                    model=MODEL_NAME,
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

                # Clean markdown blocks
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                clean_json = content.strip()

                # Extract Usage
                usage = getattr(completion, 'usage', None)
                p_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
                c_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0
                t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else 0

                # Save to Cache if key provided
                if cache_key and clean_json:
                    cls.save_to_cache(cache_key, agent_name, clean_json, "json")

                cls.log_usage(agent_name, p_tokens, c_tokens, t_tokens, elapsed_ms, "200 OK", "REAL_GROQ", 0, 0, user_id=user_id)
                logger.info(f"[{agent_name}] 🟢 LLM Gateway: Successful Real Groq Call ({t_tokens} tokens, {elapsed_ms}ms)")
                return clean_json, "REAL_GROQ"

            except Exception as e:
                err_msg = str(e)
                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                # HTTP 429 Quota Exceeded -> NO RETRY, IMMEDIATELY LOG & FALLBACK
                if "429" in err_msg or "rate_limit" in err_msg.lower():
                    logger.warning(f"[{agent_name}] 🟡 LLM Gateway HTTP 429 Rate Limit Exceeded. Using smart fallback.")
                    cls.log_usage(agent_name, 0, 0, 0, elapsed_ms, "429 RATE_LIMIT", "FALLBACK", 1, 0, error_type=err_msg[:250], user_id=user_id)
                    return "", "FALLBACK"

                # If transient error and retries remaining -> Exponential Backoff + Jitter
                if attempt < max_retries:
                    backoff = (2 ** attempt) + random.uniform(0.1, 0.5)
                    logger.info(f"[{agent_name}] Transient LLM error ({err_msg}). Retrying in {backoff:.2f}s (Attempt {attempt+1}/{max_retries})...")
                    time.sleep(backoff)
                else:
                    logger.warning(f"[{agent_name}] 🟡 LLM Gateway Call Failed after {max_retries} retries: {err_msg}")
                    cls.log_usage(agent_name, 0, 0, 0, elapsed_ms, "API_ERROR", "FALLBACK", 1, 0, error_type=err_msg[:250], user_id=user_id)

        return "", "FALLBACK"

    @classmethod
    def execute_text(cls, agent_name: str, prompt: str, system_prompt: str, cache_key: str = None, user_id: int = None) -> tuple[str, str]:
        """Executes plain-text conversational Q&A call through Gateway."""
        start_time = time.time()

        if cache_key:
            cached_data, is_hit = cls.get_cached_response(cache_key)
            if is_hit:
                cls.log_usage(agent_name, 0, 0, 0, 1.0, "200 OK (CACHED)", "CACHE", 0, 1, user_id=user_id)
                return cached_data, "CACHE"

        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
        if not api_key or api_key.startswith("gsk_demo"):
            return "", "FALLBACK"

        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            raw_text = (completion.choices[0].message.content or "").strip()

            usage = getattr(completion, 'usage', None)
            p_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
            c_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0
            t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else 0

            if cache_key and raw_text:
                cls.save_to_cache(cache_key, agent_name, raw_text, "text")

            cls.log_usage(agent_name, p_tokens, c_tokens, t_tokens, elapsed_ms, "200 OK", "REAL_GROQ", 0, 0, user_id=user_id)
            return raw_text, "REAL_GROQ"

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            err_msg = str(e)
            cls.log_usage(agent_name, 0, 0, 0, elapsed_ms, "API_ERROR", "FALLBACK", 1, 0, error_type=err_msg[:250], user_id=user_id)
            return "", "FALLBACK"

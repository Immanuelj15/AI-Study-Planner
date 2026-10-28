import os
import json
import time
import random
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Tuple, Optional, Dict, Any

from config import settings
from database.session import SessionLocal
from models.models import AIUsageLog, AICache, User, LLMProviderConfig
from services.crypto_service import CryptoService
from services.llm_providers.provider_factory import LLMProviderFactory, PROVIDER_REGISTRY

logger = logging.getLogger(__name__)

# --- CONFIGURATION TOKENS & TTL ---
PROMPT_VERSION = "v2"
DEFAULT_PROVIDER = getattr(settings, 'DEFAULT_LLM_PROVIDER', 'groq')
DEFAULT_MODEL = getattr(settings, 'DEFAULT_LLM_MODEL', 'llama-3.3-70b-versatile')
CACHE_TTL_HOURS = getattr(settings, 'CACHE_TTL_HOURS', 24)
GROQ_DAILY_TOKEN_BUDGET = getattr(settings, 'GROQ_DAILY_TOKEN_BUDGET', 100000)

class LLMGateway:
    """
    Centralized Multi-Provider LLM Gateway for Multi-Agent Study Planner.
    Handles:
    1. Provider resolution (Personal Student Key -> College Key -> Platform Default)
    2. Dynamic provider instantiation (Groq, OpenAI, Gemini, OpenRouter, Ollama)
    3. Caching (DB-backed AICache with TTL & SHA-256 keys)
    4. Token Monitoring & Quota enforcement
    5. Transient Retries & Rate-Limit (429) Handling
    6. Usage Logging (AIUsageLog)
    """

    @classmethod
    def resolve_effective_config(
        cls,
        user_id: Optional[int] = None,
        college_id: Optional[str] = None
    ) -> Tuple[str, str, str, Optional[str], str, Optional[str]]:
        """
        Resolves effective LLM provider credentials following strict priority:
        1. Personal Student Configuration (if user_id provided & personal config active)
        2. College-level Configuration (if user's college or college_id has active config)
        3. Platform Default Configuration (Groq from backend .env)

        Returns:
            (provider_id, decrypted_api_key, model_name, api_base_url, resolution_source, resolved_college_id)
        """
        db = SessionLocal()
        try:
            resolved_college_id = college_id
            if user_id and not resolved_college_id:
                user_obj = db.query(User).filter(User.id == user_id).first()
                if user_obj and user_obj.college_id:
                    resolved_college_id = user_obj.college_id

            # 1. Check Personal Configuration
            if user_id:
                personal_cfg = db.query(LLMProviderConfig).filter(
                    LLMProviderConfig.user_id == user_id,
                    LLMProviderConfig.scope == "personal",
                    LLMProviderConfig.is_active == 1
                ).order_by(LLMProviderConfig.updated_at.desc()).first()

                if personal_cfg and personal_cfg.provider:
                    try:
                        decrypted_key = CryptoService.decrypt_key(personal_cfg.encrypted_api_key) if personal_cfg.encrypted_api_key else ""
                        return (
                            personal_cfg.provider,
                            decrypted_key,
                            personal_cfg.model_name,
                            personal_cfg.api_base_url,
                            "PERSONAL",
                            resolved_college_id
                        )
                    except Exception as e:
                        logger.error(f"Failed to decrypt personal key for user {user_id}: {e}")

            # 2. Check College Configuration
            if resolved_college_id:
                college_cfg = db.query(LLMProviderConfig).filter(
                    LLMProviderConfig.college_id == resolved_college_id,
                    LLMProviderConfig.scope == "college",
                    LLMProviderConfig.is_active == 1
                ).order_by(LLMProviderConfig.updated_at.desc()).first()

                if college_cfg and college_cfg.provider:
                    try:
                        decrypted_key = CryptoService.decrypt_key(college_cfg.encrypted_api_key) if college_cfg.encrypted_api_key else ""
                        return (
                            college_cfg.provider,
                            decrypted_key,
                            college_cfg.model_name,
                            college_cfg.api_base_url,
                            "COLLEGE",
                            resolved_college_id
                        )
                    except Exception as e:
                        logger.error(f"Failed to decrypt college key for {resolved_college_id}: {e}")

            # 3. Fallback to Platform Default
            platform_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
            return (
                DEFAULT_PROVIDER,
                platform_key,
                DEFAULT_MODEL,
                None,
                "PLATFORM_DEFAULT",
                resolved_college_id
            )
        finally:
            db.close()

    @staticmethod
    def generate_cache_key(
        agent_name: str,
        topic: str,
        difficulty: str = "Medium",
        extra_params: str = "",
        provider: str = "",
        model_name: str = ""
    ) -> str:
        prov = provider or DEFAULT_PROVIDER
        mod = model_name or DEFAULT_MODEL
        raw = f"{prov}:{mod}:{PROMPT_VERSION}:{agent_name.lower()}:{topic.strip().lower()}:{difficulty.lower()}:{extra_params}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    @classmethod
    def get_cached_response(cls, cache_key: str) -> Tuple[str, bool]:
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
    def save_to_cache(
        cls,
        cache_key: str,
        agent_name: str,
        response_data: str,
        content_type: str = "json",
        model: str = DEFAULT_MODEL
    ):
        """Save AI response to DB cache with TTL."""
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            expires_at = now + timedelta(hours=CACHE_TTL_HOURS)

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
                    model=model,
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
    def log_usage(
        cls,
        agent_name: str,
        prompt_tokens: int,
        completion_tokens: int,
        total_tokens: int,
        response_time_ms: float,
        status: str,
        source: str,
        fallback_used: int,
        cached: int,
        error_type: Optional[str] = None,
        user_id: Optional[int] = None,
        college_id: Optional[str] = None,
        provider: str = DEFAULT_PROVIDER,
        model: str = DEFAULT_MODEL
    ):
        try:
            db = SessionLocal()
            log_entry = AIUsageLog(
                user_id=user_id,
                college_id=college_id,
                provider=provider,
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
            logger.warning(f"Usage Log Error: {e}")

    @classmethod
    def execute_json(
        cls,
        agent_name: str,
        prompt: str,
        system_prompt: str,
        cache_key: Optional[str] = None,
        user_id: Optional[int] = None,
        college_id: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Executes JSON LLM call through the Multi-Provider Gateway.
        Resolves provider dynamically, enforces caching, budget & error logging.
        Returns: (json_content_string, source_attribution)
        """
        start_time = time.time()

        # 1. Resolve Effective Provider Configuration
        provider_name, api_key, model_name, api_base_url, source_scope, resolved_college_id = (
            cls.resolve_effective_config(user_id=user_id, college_id=college_id)
        )

        effective_source = f"{source_scope}_{provider_name.upper()}"

        # 2. Check Cache
        if cache_key:
            cached_data, is_hit = cls.get_cached_response(cache_key)
            if is_hit:
                logger.info(f"[{agent_name}] LLM Gateway Cache Hit ({effective_source})")
                cls.log_usage(
                    agent_name=agent_name,
                    prompt_tokens=0,
                    completion_tokens=0,
                    total_tokens=0,
                    response_time_ms=1.0,
                    status="200 OK (CACHED)",
                    source="CACHE",
                    fallback_used=0,
                    cached=1,
                    user_id=user_id,
                    college_id=resolved_college_id,
                    provider=provider_name,
                    model=model_name
                )
                return cached_data, "CACHE"

        # 3. Check Platform Budget only if using Platform Default Groq
        if source_scope == "PLATFORM_DEFAULT":
            today_tokens = cls.get_today_tokens_used()
            if today_tokens >= GROQ_DAILY_TOKEN_BUDGET:
                logger.warning(f"[{agent_name}] LLM Gateway: PLATFORM_TOKEN_BUDGET_EXCEEDED ({today_tokens}/{GROQ_DAILY_TOKEN_BUDGET}).")
                cls.log_usage(
                    agent_name=agent_name,
                    prompt_tokens=0,
                    completion_tokens=0,
                    total_tokens=0,
                    response_time_ms=0.0,
                    status="BUDGET_EXCEEDED",
                    source="FALLBACK",
                    fallback_used=1,
                    cached=0,
                    error_type="Platform token budget exhausted",
                    user_id=user_id,
                    college_id=resolved_college_id,
                    provider=provider_name,
                    model=model_name
                )
                return "", "FALLBACK"

            if not api_key or api_key.startswith("gsk_demo"):
                logger.info(f"[{agent_name}] LLM Gateway: Demo platform key in use.")
                return "", "FALLBACK"

        # 4. Instantiate Provider Adapter via Factory
        try:
            provider_adapter = LLMProviderFactory.get_provider(
                provider_name=provider_name,
                api_key=api_key,
                model_name=model_name,
                api_base_url=api_base_url
            )
        except Exception as e:
            logger.error(f"[{agent_name}] LLM Gateway: Factory failed to instantiate '{provider_name}': {e}")
            cls.log_usage(
                agent_name=agent_name,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                response_time_ms=0.0,
                status="CONFIG_ERROR",
                source="FALLBACK",
                fallback_used=1,
                cached=0,
                error_type=str(e)[:250],
                user_id=user_id,
                college_id=resolved_college_id,
                provider=provider_name,
                model=model_name
            )
            return "", "FALLBACK"

        # 5. Call Provider Adapter with Retries for Transient Errors
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                content, usage = provider_adapter.generate_completion(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    temperature=0.3,
                    max_tokens=2500,
                    json_mode=True
                )
                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                # Save to Cache if key provided
                if cache_key and content:
                    cls.save_to_cache(cache_key, agent_name, content, "json", model=model_name)

                cls.log_usage(
                    agent_name=agent_name,
                    prompt_tokens=usage.get("prompt_tokens", 0),
                    completion_tokens=usage.get("completion_tokens", 0),
                    total_tokens=usage.get("total_tokens", 0),
                    response_time_ms=elapsed_ms,
                    status="200 OK",
                    source=effective_source,
                    fallback_used=0,
                    cached=0,
                    user_id=user_id,
                    college_id=resolved_college_id,
                    provider=provider_name,
                    model=model_name
                )
                logger.info(f"[{agent_name}] LLM Gateway Success: {effective_source} / {model_name} ({usage.get('total_tokens', 0)} tokens, {elapsed_ms}ms)")
                return content, effective_source

            except Exception as e:
                err_msg = str(e)
                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                # If Authentication, Quota, or 429 Error -> Immediate Fail/Log without retry
                if any(x in err_msg.lower() for x in ["401", "403", "unauthorized", "api_key", "invalid", "quota", "429"]):
                    logger.warning(f"[{agent_name}] LLM Gateway Provider Error ({effective_source}): {err_msg}")
                    cls.log_usage(
                        agent_name=agent_name,
                        prompt_tokens=0,
                        completion_tokens=0,
                        total_tokens=0,
                        response_time_ms=elapsed_ms,
                        status="PROVIDER_AUTH_OR_QUOTA_ERROR",
                        source="FALLBACK",
                        fallback_used=1,
                        cached=0,
                        error_type=err_msg[:250],
                        user_id=user_id,
                        college_id=resolved_college_id,
                        provider=provider_name,
                        model=model_name
                    )
                    return "", "FALLBACK"

                if attempt < max_retries:
                    backoff = (2 ** attempt) + random.uniform(0.1, 0.5)
                    logger.info(f"[{agent_name}] Transient error from {provider_name} ({err_msg}). Retrying in {backoff:.2f}s...")
                    time.sleep(backoff)
                else:
                    logger.warning(f"[{agent_name}] LLM Gateway Call Failed after {max_retries} retries: {err_msg}")
                    cls.log_usage(
                        agent_name=agent_name,
                        prompt_tokens=0,
                        completion_tokens=0,
                        total_tokens=0,
                        response_time_ms=elapsed_ms,
                        status="API_ERROR",
                        source="FALLBACK",
                        fallback_used=1,
                        cached=0,
                        error_type=err_msg[:250],
                        user_id=user_id,
                        college_id=resolved_college_id,
                        provider=provider_name,
                        model=model_name
                    )

        return "", "FALLBACK"

    @classmethod
    def execute_text(
        cls,
        agent_name: str,
        prompt: str,
        system_prompt: str,
        cache_key: Optional[str] = None,
        user_id: Optional[int] = None,
        college_id: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Executes conversational text Q&A call through the Multi-Provider Gateway.
        Returns: (text_content_string, source_attribution)
        """
        start_time = time.time()

        # 1. Resolve Effective Provider Configuration
        provider_name, api_key, model_name, api_base_url, source_scope, resolved_college_id = (
            cls.resolve_effective_config(user_id=user_id, college_id=college_id)
        )

        effective_source = f"{source_scope}_{provider_name.upper()}"

        if cache_key:
            cached_data, is_hit = cls.get_cached_response(cache_key)
            if is_hit:
                cls.log_usage(
                    agent_name=agent_name,
                    prompt_tokens=0,
                    completion_tokens=0,
                    total_tokens=0,
                    response_time_ms=1.0,
                    status="200 OK (CACHED)",
                    source="CACHE",
                    fallback_used=0,
                    cached=1,
                    user_id=user_id,
                    college_id=resolved_college_id,
                    provider=provider_name,
                    model=model_name
                )
                return cached_data, "CACHE"

        if source_scope == "PLATFORM_DEFAULT" and (not api_key or api_key.startswith("gsk_demo")):
            return "", "FALLBACK"

        try:
            provider_adapter = LLMProviderFactory.get_provider(
                provider_name=provider_name,
                api_key=api_key,
                model_name=model_name,
                api_base_url=api_base_url
            )
            content, usage = provider_adapter.generate_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.4,
                max_tokens=2000,
                json_mode=False
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            if cache_key and content:
                cls.save_to_cache(cache_key, agent_name, content, "text", model=model_name)

            cls.log_usage(
                agent_name=agent_name,
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0),
                response_time_ms=elapsed_ms,
                status="200 OK",
                source=effective_source,
                fallback_used=0,
                cached=0,
                user_id=user_id,
                college_id=resolved_college_id,
                provider=provider_name,
                model=model_name
            )
            return content, effective_source

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            err_msg = str(e)
            logger.warning(f"[{agent_name}] LLM Gateway execute_text failed ({effective_source}): {err_msg}")
            cls.log_usage(
                agent_name=agent_name,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                response_time_ms=elapsed_ms,
                status="API_ERROR",
                source="FALLBACK",
                fallback_used=1,
                cached=0,
                error_type=err_msg[:250],
                user_id=user_id,
                college_id=resolved_college_id,
                provider=provider_name,
                model=model_name
            )
            return "", "FALLBACK"

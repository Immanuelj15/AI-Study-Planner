import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.session import get_db
from models.models import User, LLMProviderConfig, AIUsageLog
from services.auth import get_current_user
from services.crypto_service import CryptoService
from services.llm_providers.provider_factory import LLMProviderFactory, PROVIDER_REGISTRY
from services.llm_gateway import LLMGateway, DEFAULT_PROVIDER, DEFAULT_MODEL
from schemas.schemas import (
    LLMProviderConfigRequest,
    LLMProviderConfigResponse,
    LLMActiveConfigResponse,
    LLMTestConnectionRequest,
    LLMTestConnectionResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/llm", tags=["LLM Provider & Key Management"])

# Helper: Build safe masked response object
def _to_provider_response(cfg: Optional[LLMProviderConfig]) -> Optional[LLMProviderConfigResponse]:
    if not cfg:
        return None
    masked = CryptoService.mask_key(cfg.encrypted_api_key, is_cipher=True) if cfg.encrypted_api_key else ""
    return LLMProviderConfigResponse(
        id=cfg.id,
        scope=cfg.scope,
        provider=cfg.provider,
        model_name=cfg.model_name,
        api_base_url=cfg.api_base_url,
        masked_api_key=masked,
        has_api_key=bool(cfg.encrypted_api_key),
        is_active=bool(cfg.is_active),
        created_at=cfg.created_at,
        updated_at=cfg.updated_at
    )


@router.get("/providers", response_model=List[Dict[str, Any]])
def list_providers(current_user: User = Depends(get_current_user)):
    """List all supported LLM providers, their recommended models, and configuration metadata."""
    return LLMProviderFactory.list_supported_providers()


@router.get("/config", response_model=LLMActiveConfigResponse)
def get_user_llm_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the current user's personal configuration, their college configuration (if any),
    and the overall effective provider resolved by the Gateway priority engine.
    """
    # 1. Fetch personal config
    personal_cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.user_id == current_user.id,
        LLMProviderConfig.scope == "personal",
        LLMProviderConfig.is_active == 1
    ).order_by(LLMProviderConfig.updated_at.desc()).first()

    # 2. Fetch college config if college_id exists
    college_cfg = None
    if current_user.college_id:
        college_cfg = db.query(LLMProviderConfig).filter(
            LLMProviderConfig.college_id == current_user.college_id,
            LLMProviderConfig.scope == "college",
            LLMProviderConfig.is_active == 1
        ).order_by(LLMProviderConfig.updated_at.desc()).first()

    # 3. Resolve effective configuration
    eff_prov, eff_key, eff_model, eff_base, eff_scope, _ = LLMGateway.resolve_effective_config(
        user_id=current_user.id,
        college_id=current_user.college_id
    )

    masked_eff = CryptoService.mask_key(eff_key) if eff_key else ("(No API Key Required)" if eff_prov == "ollama" else "")

    return LLMActiveConfigResponse(
        effective_provider=eff_prov,
        effective_model=eff_model,
        effective_scope=eff_scope,
        masked_api_key=masked_eff,
        has_key=bool(eff_key or eff_prov == "ollama"),
        personal_config=_to_provider_response(personal_cfg),
        college_config=_to_provider_response(college_cfg),
        platform_default_provider=DEFAULT_PROVIDER,
        platform_default_model=DEFAULT_MODEL
    )


@router.post("/config", response_model=LLMProviderConfigResponse)
def save_personal_llm_config(
    payload: LLMProviderConfigRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves or updates the authenticated user's personal LLM provider configuration.
    API keys are strictly encrypted via Fernet before database persistence.
    """
    prov = payload.provider.lower().strip()
    if not LLMProviderFactory.is_provider_supported(prov):
        raise HTTPException(status_code=400, detail=f"Unsupported provider '{payload.provider}'.")

    # Find existing config or create new
    cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.user_id == current_user.id,
        LLMProviderConfig.scope == "personal"
    ).first()

    # Handle encryption
    encrypted_key = None
    if payload.api_key and payload.api_key.strip():
        encrypted_key = CryptoService.encrypt_key(payload.api_key.strip())
    elif cfg and cfg.encrypted_api_key:
        # Retain existing encrypted key if not provided in update
        encrypted_key = cfg.encrypted_api_key
    elif prov != "ollama":
        # API key is mandatory for non-ollama providers
        raise HTTPException(
            status_code=400,
            detail=f"An API key is required to configure {prov.capitalize()}."
        )

    now = datetime.utcnow()
    if cfg:
        cfg.provider = prov
        cfg.model_name = payload.model_name.strip()
        cfg.api_base_url = payload.api_base_url.strip() if payload.api_base_url else None
        cfg.encrypted_api_key = encrypted_key
        cfg.is_active = 1
        cfg.updated_at = now
    else:
        cfg = LLMProviderConfig(
            user_id=current_user.id,
            college_id=current_user.college_id,
            scope="personal",
            provider=prov,
            model_name=payload.model_name.strip(),
            api_base_url=payload.api_base_url.strip() if payload.api_base_url else None,
            encrypted_api_key=encrypted_key,
            is_active=1,
            created_at=now,
            updated_at=now
        )
        db.add(cfg)

    db.commit()
    db.refresh(cfg)
    logger.info(f"User {current_user.id} updated personal LLM config -> {prov}:{payload.model_name}")
    return _to_provider_response(cfg)


@router.delete("/config")
def delete_personal_llm_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes the current user's personal configuration.
    The user will seamlessly fall back to their college or platform default provider.
    """
    cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.user_id == current_user.id,
        LLMProviderConfig.scope == "personal"
    ).first()

    if not cfg:
        return {"status": "success", "message": "No personal configuration found to delete."}

    db.delete(cfg)
    db.commit()
    logger.info(f"User {current_user.id} deleted personal LLM config. Reverting to fallback hierarchy.")
    return {"status": "success", "message": "Personal API key deleted successfully. Reverted to platform/college default."}


@router.post("/test-connection", response_model=LLMTestConnectionResponse)
def test_llm_connection(
    payload: LLMTestConnectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Performs a lightweight credentials and reachability test to the specified LLM provider.
    Never exposes raw API keys in response messages or error details.
    """
    prov = payload.provider.lower().strip()
    if not LLMProviderFactory.is_provider_supported(prov):
        return LLMTestConnectionResponse(
            success=False,
            message=f"Unsupported provider: {payload.provider}",
            latency_ms=0.0,
            provider=payload.provider,
            model=payload.model_name
        )

    api_key = payload.api_key or ""
    # If using stored key
    if payload.use_stored_key and not api_key:
        personal_cfg = db.query(LLMProviderConfig).filter(
            LLMProviderConfig.user_id == current_user.id,
            LLMProviderConfig.scope == "personal",
            LLMProviderConfig.is_active == 1
        ).first()
        if personal_cfg and personal_cfg.encrypted_api_key:
            try:
                api_key = CryptoService.decrypt_key(personal_cfg.encrypted_api_key)
            except Exception:
                return LLMTestConnectionResponse(
                    success=False,
                    message="Failed to decrypt stored credentials.",
                    latency_ms=0.0,
                    provider=prov,
                    model=payload.model_name
                )
        elif prov != "ollama":
            return LLMTestConnectionResponse(
                success=False,
                message="No stored API key found for this user.",
                latency_ms=0.0,
                provider=prov,
                model=payload.model_name
            )

    try:
        adapter = LLMProviderFactory.get_provider(
            provider_name=prov,
            api_key=api_key,
            model_name=payload.model_name,
            api_base_url=payload.api_base_url
        )
        is_success, msg, latency = adapter.test_connection()
        return LLMTestConnectionResponse(
            success=is_success,
            message=msg,
            latency_ms=latency,
            provider=prov,
            model=payload.model_name
        )
    except Exception as e:
        logger.warning(f"Test connection error: {e}")
        return LLMTestConnectionResponse(
            success=False,
            message=f"Provider test error: {str(e)[:150]}",
            latency_ms=0.0,
            provider=prov,
            model=payload.model_name
        )


# --- College Admin Endpoints ---
@router.get("/college-config", response_model=Optional[LLMProviderConfigResponse])
def get_college_llm_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves college-level LLM configuration.
    Allowed for Faculty, College Admin, and Platform Admin.
    """
    if current_user.role not in ["Faculty", "College Admin", "Platform Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to college faculty and administrators."
        )

    if not current_user.college_id:
        raise HTTPException(status_code=400, detail="User is not associated with any college.")

    cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.college_id == current_user.college_id,
        LLMProviderConfig.scope == "college",
        LLMProviderConfig.is_active == 1
    ).order_by(LLMProviderConfig.updated_at.desc()).first()

    return _to_provider_response(cfg)


@router.post("/college-config", response_model=LLMProviderConfigResponse)
def save_college_llm_config(
    payload: LLMProviderConfigRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Configures college-level LLM provider and API key.
    Enforces role-based access: Only College Admin or Platform Admin can configure.
    """
    if current_user.role not in ["College Admin", "Platform Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only College Administrators can manage college-level AI keys."
        )

    if not current_user.college_id:
        raise HTTPException(status_code=400, detail="Administrator has no college affiliation.")

    prov = payload.provider.lower().strip()
    if not LLMProviderFactory.is_provider_supported(prov):
        raise HTTPException(status_code=400, detail=f"Unsupported provider '{payload.provider}'.")

    cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.college_id == current_user.college_id,
        LLMProviderConfig.scope == "college"
    ).first()

    encrypted_key = None
    if payload.api_key and payload.api_key.strip():
        encrypted_key = CryptoService.encrypt_key(payload.api_key.strip())
    elif cfg and cfg.encrypted_api_key:
        encrypted_key = cfg.encrypted_api_key
    elif prov != "ollama":
        raise HTTPException(
            status_code=400,
            detail=f"An API key is required to configure college-level {prov.capitalize()}."
        )

    now = datetime.utcnow()
    if cfg:
        cfg.provider = prov
        cfg.model_name = payload.model_name.strip()
        cfg.api_base_url = payload.api_base_url.strip() if payload.api_base_url else None
        cfg.encrypted_api_key = encrypted_key
        cfg.is_active = 1
        cfg.updated_at = now
    else:
        cfg = LLMProviderConfig(
            college_id=current_user.college_id,
            scope="college",
            provider=prov,
            model_name=payload.model_name.strip(),
            api_base_url=payload.api_base_url.strip() if payload.api_base_url else None,
            encrypted_api_key=encrypted_key,
            is_active=1,
            created_at=now,
            updated_at=now
        )
        db.add(cfg)

    db.commit()
    db.refresh(cfg)
    logger.info(f"College Admin {current_user.id} updated college {current_user.college_id} LLM config -> {prov}:{payload.model_name}")
    return _to_provider_response(cfg)


@router.delete("/college-config")
def delete_college_llm_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes college-level LLM configuration (College Admin only)."""
    if current_user.role not in ["College Admin", "Platform Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only College Administrators can delete college-level AI keys."
        )

    cfg = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.college_id == current_user.college_id,
        LLMProviderConfig.scope == "college"
    ).first()

    if not cfg:
        return {"status": "success", "message": "No college configuration found to delete."}

    db.delete(cfg)
    db.commit()
    logger.info(f"College Admin {current_user.id} deleted college {current_user.college_id} LLM config.")
    return {"status": "success", "message": "College AI key deleted. Students will use personal or platform keys."}


@router.get("/usage")
def get_user_llm_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns AI usage statistics from AIUsageLog grouped by provider and model.
    """
    # 1. Total summary for this user
    user_logs = db.query(AIUsageLog).filter(AIUsageLog.user_id == current_user.id).all()
    total_requests = len(user_logs)
    total_tokens = sum(l.total_tokens or 0 for l in user_logs)
    cached_requests = sum(1 for l in user_logs if l.cached == 1)
    fallback_requests = sum(1 for l in user_logs if l.fallback_used == 1)
    success_requests = sum(1 for l in user_logs if "200" in (l.status or ""))

    # 2. Breakdown by Provider
    by_provider: Dict[str, Dict[str, Any]] = {}
    for l in user_logs:
        prov = l.provider or "groq"
        if prov not in by_provider:
            by_provider[prov] = {"requests": 0, "total_tokens": 0, "errors": 0}
        by_provider[prov]["requests"] += 1
        by_provider[prov]["total_tokens"] += (l.total_tokens or 0)
        if l.status and "200" not in l.status:
            by_provider[prov]["errors"] += 1

    # 3. Recent 10 logs
    recent_logs = [
        {
            "id": l.id,
            "agent_name": l.agent_name,
            "provider": l.provider or "groq",
            "model": l.model,
            "tokens": l.total_tokens,
            "response_time_ms": l.response_time_ms,
            "status": l.status,
            "source": l.source,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else None
        }
        for l in sorted(user_logs, key=lambda x: x.created_at or datetime.min, reverse=True)[:10]
    ]

    return {
        "total_requests": total_requests,
        "total_tokens": total_tokens,
        "cached_requests": cached_requests,
        "fallback_requests": fallback_requests,
        "success_rate": round((success_requests / total_requests * 100), 1) if total_requests > 0 else 100.0,
        "breakdown_by_provider": by_provider,
        "recent_activity": recent_logs
    }

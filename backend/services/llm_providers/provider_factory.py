import logging
from typing import Dict, Any, List, Optional
from services.llm_providers.base_provider import BaseLLMProvider
from services.llm_providers.groq_provider import GroqProvider
from services.llm_providers.openai_provider import OpenAIProvider
from services.llm_providers.gemini_provider import GeminiProvider
from services.llm_providers.openrouter_provider import OpenRouterProvider
from services.llm_providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)

PROVIDER_REGISTRY = {
    "groq": {
        "id": "groq",
        "name": "Groq",
        "class": GroqProvider,
        "default_model": GroqProvider.DEFAULT_MODEL,
        "supported_models": GroqProvider.SUPPORTED_MODELS,
        "requires_api_key": True,
        "has_base_url": False,
        "description": "Ultra-low latency inference engine running open-source Llama & Mixtral models."
    },
    "openai": {
        "id": "openai",
        "name": "OpenAI",
        "class": OpenAIProvider,
        "default_model": OpenAIProvider.DEFAULT_MODEL,
        "supported_models": OpenAIProvider.SUPPORTED_MODELS,
        "requires_api_key": True,
        "has_base_url": False,
        "description": "Industry-standard proprietary GPT-4o, GPT-4o-mini, and GPT-4-turbo models."
    },
    "gemini": {
        "id": "gemini",
        "name": "Google Gemini",
        "class": GeminiProvider,
        "default_model": GeminiProvider.DEFAULT_MODEL,
        "supported_models": GeminiProvider.SUPPORTED_MODELS,
        "requires_api_key": True,
        "has_base_url": False,
        "description": "Google's multimodal Gemini 1.5 Flash, 1.5 Pro, and 2.0 Flash models."
    },
    "openrouter": {
        "id": "openrouter",
        "name": "OpenRouter",
        "class": OpenRouterProvider,
        "default_model": OpenRouterProvider.DEFAULT_MODEL,
        "supported_models": OpenRouterProvider.SUPPORTED_MODELS,
        "requires_api_key": True,
        "has_base_url": True,
        "default_base_url": OpenRouterProvider.DEFAULT_BASE_URL,
        "description": "Unified routing platform supporting Claude 3.5, DeepSeek, Llama, and Gemini."
    },
    "ollama": {
        "id": "ollama",
        "name": "Ollama (Self-Hosted)",
        "class": OllamaProvider,
        "default_model": OllamaProvider.DEFAULT_MODEL,
        "supported_models": OllamaProvider.SUPPORTED_MODELS,
        "requires_api_key": False,
        "has_base_url": True,
        "default_base_url": OllamaProvider.DEFAULT_BASE_URL,
        "description": "Local privacy-first LLM runner running open weights models without third-party cloud."
    }
}

class LLMProviderFactory:
    """Factory and registry for instantiating LLM provider adapters."""

    @classmethod
    def get_provider(
        cls,
        provider_name: str,
        api_key: str = "",
        model_name: str = "",
        api_base_url: Optional[str] = None
    ) -> BaseLLMProvider:
        key = (provider_name or "").lower().strip()
        if key not in PROVIDER_REGISTRY:
            raise ValueError(f"Unsupported LLM provider '{provider_name}'. Supported: {list(PROVIDER_REGISTRY.keys())}")

        provider_meta = PROVIDER_REGISTRY[key]
        provider_class = provider_meta["class"]
        selected_model = model_name or provider_meta["default_model"]
        base_url = api_base_url or provider_meta.get("default_base_url")

        return provider_class(
            api_key=api_key,
            model_name=selected_model,
            api_base_url=base_url
        )

    @classmethod
    def list_supported_providers(cls) -> List[Dict[str, Any]]:
        results = []
        for pid, meta in PROVIDER_REGISTRY.items():
            results.append({
                "id": pid,
                "name": meta["name"],
                "default_model": meta["default_model"],
                "supported_models": meta["supported_models"],
                "requires_api_key": meta["requires_api_key"],
                "has_base_url": meta["has_base_url"],
                "default_base_url": meta.get("default_base_url"),
                "description": meta["description"]
            })
        return results

    @classmethod
    def is_provider_supported(cls, provider_name: str) -> bool:
        return (provider_name or "").lower().strip() in PROVIDER_REGISTRY

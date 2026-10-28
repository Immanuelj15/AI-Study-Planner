from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any, Optional

class BaseLLMProvider(ABC):
    """
    Abstract base class for LLM Provider Adapters.
    Standardizes text generation, structured JSON generation, and connection testing.
    """

    def __init__(self, api_key: str = "", model_name: str = "", api_base_url: Optional[str] = None):
        self.api_key = api_key
        self.model_name = model_name
        self.api_base_url = api_base_url

    @abstractmethod
    def generate_completion(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2500,
        json_mode: bool = False
    ) -> Tuple[str, Dict[str, int]]:
        """
        Executes a prompt against the provider.
        Returns:
            (completion_text, {"prompt_tokens": int, "completion_tokens": int, "total_tokens": int})
        """
        pass

    @abstractmethod
    def test_connection(self) -> Tuple[bool, str, float]:
        """
        Sends a lightweight request to verify credentials and connectivity.
        Returns:
            (is_success: bool, message: str, latency_ms: float)
        """
        pass

    @staticmethod
    def clean_json_output(content: str) -> str:
        """Helper to strip markdown fences from JSON output."""
        cleaned = content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

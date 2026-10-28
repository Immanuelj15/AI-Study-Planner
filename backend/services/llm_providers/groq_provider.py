import time
import logging
from typing import Tuple, Dict, Any, Optional
from services.llm_providers.base_provider import BaseLLMProvider

logger = logging.getLogger(__name__)

class GroqProvider(BaseLLMProvider):
    """Adapter for Groq Cloud API."""

    DEFAULT_MODEL = "llama-3.3-70b-versatile"
    SUPPORTED_MODELS = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ]

    def __init__(self, api_key: str = "", model_name: str = "", api_base_url: Optional[str] = None):
        super().__init__(
            api_key=api_key,
            model_name=model_name or self.DEFAULT_MODEL,
            api_base_url=api_base_url
        )

    def generate_completion(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2500,
        json_mode: bool = False
    ) -> Tuple[str, Dict[str, int]]:
        from groq import Groq
        if not self.api_key:
            raise ValueError("Groq API key is missing or empty.")

        client = Groq(api_key=self.api_key)
        kwargs: Dict[str, Any] = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        completion = client.chat.completions.create(**kwargs)
        raw_content = completion.choices[0].message.content or ""
        content = self.clean_json_output(raw_content) if json_mode else raw_content.strip()

        usage = getattr(completion, 'usage', None)
        p_tokens = getattr(usage, 'prompt_tokens', 0) if usage else 0
        c_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0
        t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else 0

        return content, {
            "prompt_tokens": p_tokens,
            "completion_tokens": c_tokens,
            "total_tokens": t_tokens
        }

    def test_connection(self) -> Tuple[bool, str, float]:
        start = time.time()
        try:
            from groq import Groq
            if not self.api_key or not self.api_key.strip():
                return False, "API key is required.", 0.0

            client = Groq(api_key=self.api_key)
            completion = client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": "Respond with PONG."}],
                max_tokens=10,
                temperature=0.0
            )
            elapsed_ms = round((time.time() - start) * 1000, 2)
            reply = (completion.choices[0].message.content or "").strip()
            return True, f"Connection verified successfully ({reply})", elapsed_ms
        except Exception as e:
            elapsed_ms = round((time.time() - start) * 1000, 2)
            err = str(e).lower()
            if "401" in err or "invalid_api_key" in err or "unauthorized" in err:
                return False, "Invalid API key. Please check your Groq credentials.", elapsed_ms
            elif "404" in err or "model_not_found" in err:
                return False, f"Model '{self.model_name}' not found or unsupported by Groq.", elapsed_ms
            elif "429" in err or "rate_limit" in err:
                return False, "Groq rate limit exceeded or insufficient quota.", elapsed_ms
            elif "connection" in err or "timeout" in err:
                return False, "Groq service unavailable or network timeout.", elapsed_ms
            return False, f"Groq error: {str(e)[:150]}", elapsed_ms

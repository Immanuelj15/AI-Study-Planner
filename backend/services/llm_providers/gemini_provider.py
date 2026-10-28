import time
import logging
from typing import Tuple, Dict, Any, Optional
from services.llm_providers.base_provider import BaseLLMProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    """Adapter for Google Gemini API."""

    DEFAULT_MODEL = "gemini-1.5-flash"
    SUPPORTED_MODELS = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash"
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
        import google.generativeai as genai
        if not self.api_key:
            raise ValueError("Google Gemini API key is missing or empty.")

        genai.configure(api_key=self.api_key)
        
        # Configure model with optional system instruction
        system_instruction = system_prompt if system_prompt else None
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction
        )

        gen_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens
        }
        if json_mode:
            gen_config["response_mime_type"] = "application/json"

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(**gen_config)
        )

        raw_text = getattr(response, 'text', '') or ""
        content = self.clean_json_output(raw_text) if json_mode else raw_text.strip()

        p_tokens, c_tokens, t_tokens = 0, 0, 0
        usage = getattr(response, 'usage_metadata', None)
        if usage:
            p_tokens = getattr(usage, 'prompt_token_count', 0)
            c_tokens = getattr(usage, 'candidates_token_count', 0)
            t_tokens = getattr(usage, 'total_token_count', p_tokens + c_tokens)

        return content, {
            "prompt_tokens": p_tokens,
            "completion_tokens": c_tokens,
            "total_tokens": t_tokens
        }

    def test_connection(self) -> Tuple[bool, str, float]:
        start = time.time()
        try:
            import google.generativeai as genai
            if not self.api_key or not self.api_key.strip():
                return False, "API key is required.", 0.0

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(model_name=self.model_name)
            response = model.generate_content(
                "Respond with PONG.",
                generation_config=genai.GenerationConfig(max_output_tokens=10, temperature=0.0)
            )
            elapsed_ms = round((time.time() - start) * 1000, 2)
            reply = getattr(response, 'text', '').strip()
            return True, f"Connection verified successfully ({reply})", elapsed_ms
        except Exception as e:
            elapsed_ms = round((time.time() - start) * 1000, 2)
            err = str(e).lower()
            if "api_key_invalid" in err or "permission" in err or "403" in err or "unauthenticated" in err:
                return False, "Invalid Google Gemini API key.", elapsed_ms
            elif "not_found" in err or "404" in err:
                return False, f"Model '{self.model_name}' not found or unsupported by Gemini.", elapsed_ms
            elif "resource_exhausted" in err or "429" in err or "quota" in err:
                return False, "Google Gemini quota exhausted or rate limit reached.", elapsed_ms
            elif "connection" in err or "timeout" in err:
                return False, "Google Gemini network timeout or service unreachable.", elapsed_ms
            return False, f"Gemini error: {str(e)[:150]}", elapsed_ms

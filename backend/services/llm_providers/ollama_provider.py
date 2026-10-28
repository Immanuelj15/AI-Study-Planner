import time
import logging
import httpx
from typing import Tuple, Dict, Any, Optional
from services.llm_providers.base_provider import BaseLLMProvider

logger = logging.getLogger(__name__)

class OllamaProvider(BaseLLMProvider):
    """Adapter for local or private Ollama instances."""

    DEFAULT_BASE_URL = "http://localhost:11434"
    DEFAULT_MODEL = "llama3.2"
    SUPPORTED_MODELS = [
        "llama3.2",
        "llama3.1",
        "mistral",
        "phi3",
        "qwen2.5",
        "deepseek-r1:8b"
    ]

    def __init__(self, api_key: str = "", model_name: str = "", api_base_url: Optional[str] = None):
        base_url = (api_base_url or self.DEFAULT_BASE_URL).rstrip("/")
        super().__init__(
            api_key=api_key or "",
            model_name=model_name or self.DEFAULT_MODEL,
            api_base_url=base_url
        )

    def generate_completion(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2500,
        json_mode: bool = False
    ) -> Tuple[str, Dict[str, int]]:
        url = f"{self.api_base_url}/api/chat"
        payload: Dict[str, Any] = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        if json_mode:
            payload["format"] = "json"

        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                raise ValueError(f"Ollama HTTP {resp.status_code}: {resp.text[:200]}")
            data = resp.json()

        raw_content = data.get("message", {}).get("content", "")
        content = self.clean_json_output(raw_content) if json_mode else raw_content.strip()

        p_tokens = data.get("prompt_eval_count", 0)
        c_tokens = data.get("eval_count", 0)
        t_tokens = p_tokens + c_tokens

        return content, {
            "prompt_tokens": p_tokens,
            "completion_tokens": c_tokens,
            "total_tokens": t_tokens
        }

    def test_connection(self) -> Tuple[bool, str, float]:
        start = time.time()
        try:
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            with httpx.Client(timeout=10.0) as client:
                # 1. Check if Ollama daemon is reachable
                tags_url = f"{self.api_base_url}/api/tags"
                try:
                    tags_resp = client.get(tags_url, headers=headers)
                except httpx.ConnectError:
                    elapsed_ms = round((time.time() - start) * 1000, 2)
                    return False, f"Cannot connect to Ollama at {self.api_base_url}. Ensure Ollama is running ('ollama serve').", elapsed_ms

                if tags_resp.status_code != 200:
                    elapsed_ms = round((time.time() - start) * 1000, 2)
                    return False, f"Ollama returned HTTP {tags_resp.status_code} on health check.", elapsed_ms

                # Check if model exists locally
                models_data = tags_resp.json().get("models", [])
                model_names = [m.get("name", "").split(":")[0] for m in models_data]
                full_model_names = [m.get("name", "") for m in models_data]
                requested_clean = self.model_name.split(":")[0]

                # 2. Perform quick test ping
                chat_url = f"{self.api_base_url}/api/chat"
                ping_payload = {
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": "Respond with PONG."}],
                    "stream": False,
                    "options": {"num_predict": 5, "temperature": 0.0}
                }
                chat_resp = client.post(chat_url, json=ping_payload, headers=headers)
                elapsed_ms = round((time.time() - start) * 1000, 2)

                if chat_resp.status_code == 200:
                    return True, f"Ollama connection verified successfully for '{self.model_name}'.", elapsed_ms
                elif chat_resp.status_code == 404:
                    return False, f"Model '{self.model_name}' is not downloaded in Ollama. Run: `ollama run {self.model_name}`", elapsed_ms
                else:
                    return False, f"Ollama chat test failed with HTTP {chat_resp.status_code}: {chat_resp.text[:150]}", elapsed_ms

        except Exception as e:
            elapsed_ms = round((time.time() - start) * 1000, 2)
            return False, f"Ollama connection error: {str(e)[:150]}", elapsed_ms

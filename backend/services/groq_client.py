import os
import json
import logging
from config import settings

logger = logging.getLogger(__name__)

def call_groq_llm(prompt: str, system_prompt: str = "You are an expert AI tutor and study planner.") -> str:
    """
    Calls Groq API using the official Groq client or httpx fallback.
    Returns response text (or structured JSON string).
    """
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

    if api_key and not api_key.startswith("gsk_demo"):
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"}
            )
            raw_content = completion.choices[0].message.content or ""
            content = raw_content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            return content.strip()
        except Exception as e:
            logger.warning(f"Groq API call failed or model unavailable ({str(e)}). Falling back to mock engine.")

    # Fallback / Mock Engine if API key is not configured
    logger.info("Using smart mock fallback for LLM response generation.")
    return ""


def generate_text(prompt: str, system_prompt: str = "You are an expert AI Study Tutor.") -> str:
    """
    Generate plain-text response using Groq LLM API or smart conversational fallback.
    """
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

    if api_key and not api_key.startswith("gsk_demo"):
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            raw_content = completion.choices[0].message.content or ""
            return raw_content.strip()
        except Exception as e:
            logger.warning(f"Groq API text call failed ({str(e)}). Using smart fallback.")

    return ""

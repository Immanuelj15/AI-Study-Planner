import os
import logging
from cryptography.fernet import Fernet, InvalidToken
from config import settings

logger = logging.getLogger(__name__)

class CryptoService:
    """
    Cryptographic Service for securing LLM API keys at rest.
    Uses AES-128-CBC with HMAC via Fernet symmetric encryption.
    Enforces strict secure failure if key is missing or invalid.
    """

    @staticmethod
    def _get_fernet() -> Fernet:
        key = getattr(settings, 'LLM_ENCRYPTION_KEY', None) or os.getenv("LLM_ENCRYPTION_KEY", "")
        if not key:
            logger.critical("LLM_ENCRYPTION_KEY is not configured! Failing securely.")
            raise ValueError("Encryption service is unavailable. LLM_ENCRYPTION_KEY not set.")
        try:
            return Fernet(key.encode('utf-8'))
        except Exception as e:
            logger.critical(f"Invalid LLM_ENCRYPTION_KEY format: {e}")
            raise ValueError(f"Invalid encryption key configuration: {e}")

    @classmethod
    def encrypt_key(cls, plain_key: str) -> str:
        """Encrypts plaintext API key into base64 ciphertext string."""
        if not plain_key or not plain_key.strip():
            return ""
        fernet = cls._get_fernet()
        encrypted_bytes = fernet.encrypt(plain_key.strip().encode('utf-8'))
        return encrypted_bytes.decode('utf-8')

    @classmethod
    def decrypt_key(cls, cipher_text: str) -> str:
        """Decrypts ciphertext string back to plaintext API key."""
        if not cipher_text or not cipher_text.strip():
            return ""
        fernet = cls._get_fernet()
        try:
            decrypted_bytes = fernet.decrypt(cipher_text.strip().encode('utf-8'))
            return decrypted_bytes.decode('utf-8')
        except InvalidToken:
            logger.error("Failed to decrypt API key: Invalid token or changed secret key.")
            raise ValueError("Failed to decrypt API key. Cryptographic token invalid.")
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            raise ValueError("Failed to decrypt stored credentials.")

    @classmethod
    def mask_key(cls, plain_or_cipher_key: str, is_cipher: bool = False) -> str:
        """
        Produces safe masked representation e.g., 'sk-************1234' or 'gsk_************5678'.
        Never returns full key.
        """
        if not plain_or_cipher_key:
            return ""
        try:
            plain = cls.decrypt_key(plain_or_cipher_key) if is_cipher else plain_or_cipher_key
        except Exception:
            return "********"

        plain = plain.strip()
        if len(plain) <= 8:
            return "********"

        # Determine prefix length (e.g., 'sk-', 'gsk_', 'AIzaSy...')
        prefix = ""
        if plain.startswith("gsk_"):
            prefix = "gsk_"
            body = plain[4:]
        elif plain.startswith("sk-ant-"):
            prefix = "sk-ant-"
            body = plain[7:]
        elif plain.startswith("sk-or-"):
            prefix = "sk-or-"
            body = plain[6:]
        elif plain.startswith("sk-"):
            prefix = "sk-"
            body = plain[3:]
        elif plain.startswith("AIza"):
            prefix = "AIza"
            body = plain[4:]
        else:
            prefix = plain[:3]
            body = plain[3:]

        suffix = body[-4:] if len(body) >= 4 else plain[-4:]
        masked_center = "************"
        return f"{prefix}{masked_center}{suffix}"

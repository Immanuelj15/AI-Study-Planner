import os
import sys
import json
import logging
from datetime import datetime

# Setup paths
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database.session import SessionLocal, engine
from database.base import Base
from models.models import User, LLMProviderConfig, AIUsageLog
from services.crypto_service import CryptoService
from services.llm_providers.provider_factory import LLMProviderFactory, PROVIDER_REGISTRY
from services.llm_gateway import LLMGateway
from services.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestLLMManagement")

def run_tests():
    print("=" * 60)
    print("RUNNING MULTI-PROVIDER LLM API KEY MANAGEMENT TEST SUITE")
    print("=" * 60)

    # 1. Test CryptoService
    print("\n--- TEST 1: Encryption & Key Masking ---")
    test_key = "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz"
    encrypted = CryptoService.encrypt_key(test_key)
    assert encrypted != test_key, "Encrypted key must not be plaintext!"
    assert len(encrypted) > len(test_key), "Fernet ciphertext should be base64 encoded"
    print(f"Encrypted successfully: {encrypted[:20]}...")

    decrypted = CryptoService.decrypt_key(encrypted)
    assert decrypted == test_key, "Decrypted key must match original!"
    print("Decrypted successfully and matched!")

    masked = CryptoService.mask_key(test_key)
    assert "sk-************" in masked, f"Mask format incorrect: {masked}"
    assert "1234567890" not in masked, "Masked key must not reveal secret body!"
    assert masked.endswith(test_key[-4:]), "Masked key should preserve last 4 chars"
    print(f"Masked key preview: {masked}")

    # Test Groq key mask
    groq_key = "gsk_abcd1234efgh5678ijkl9012"
    masked_groq = CryptoService.mask_key(groq_key)
    assert masked_groq.startswith("gsk_************"), f"Groq mask invalid: {masked_groq}"
    print(f"Masked Groq key preview: {masked_groq}")

    # 2. Test Provider Factory
    print("\n--- TEST 2: Provider Factory & 5 Supported Providers ---")
    providers = LLMProviderFactory.list_supported_providers()
    provider_ids = [p["id"] for p in providers]
    print(f"Registered Providers ({len(providers)}): {provider_ids}")
    assert set(["groq", "openai", "gemini", "openrouter", "ollama"]).issubset(set(provider_ids)), "Missing required provider!"

    for p in providers:
        print(f"  -> {p['name']} (ID: {p['id']}) | Default Model: {p['default_model']} | Models: {len(p['supported_models'])}")
        adapter = LLMProviderFactory.get_provider(p["id"], api_key="test_dummy_key", model_name=p["default_model"])
        assert adapter is not None, f"Failed to instantiate adapter for {p['id']}"

    # 3. Test Database Persistence & Priority Hierarchy
    print("\n--- TEST 3: Priority Resolution (Personal > College > Platform) ---")
    db = SessionLocal()
    try:
        # Create or fetch test student
        test_student = db.query(User).filter(User.email == "test_student_llm@studyplanner.ai").first()
        if not test_student:
            test_student = User(
                name="Test Student LLM",
                email="test_student_llm@studyplanner.ai",
                password=get_password_hash("password123"),
                role="Student",
                college_id="Test_College_Alpha"
            )
            db.add(test_student)
            db.commit()
            db.refresh(test_student)

        # Clear existing configs for clean test
        db.query(LLMProviderConfig).filter(
            (LLMProviderConfig.user_id == test_student.id) | 
            (LLMProviderConfig.college_id == "Test_College_Alpha")
        ).delete()
        db.commit()

        # Step 3A: No personal or college config -> should resolve to PLATFORM_DEFAULT
        prov, key, mod, base, scope, col = LLMGateway.resolve_effective_config(
            user_id=test_student.id,
            college_id=test_student.college_id
        )
        assert scope == "PLATFORM_DEFAULT", f"Expected PLATFORM_DEFAULT, got {scope}"
        assert prov == "groq", f"Expected default groq, got {prov}"
        print(f"  Step 3A (No configs): Resolved to {scope} ({prov}/{mod}) -> PASS")

        # Step 3B: Configure College Key -> should resolve to COLLEGE
        college_config = LLMProviderConfig(
            college_id="Test_College_Alpha",
            scope="college",
            provider="openai",
            model_name="gpt-4o-mini",
            encrypted_api_key=CryptoService.encrypt_key("sk-college-test-key-9999"),
            is_active=1,
            created_at=datetime.utcnow()
        )
        db.add(college_config)
        db.commit()

        prov, key, mod, base, scope, col = LLMGateway.resolve_effective_config(
            user_id=test_student.id,
            college_id=test_student.college_id
        )
        assert scope == "COLLEGE", f"Expected COLLEGE, got {scope}"
        assert prov == "openai", f"Expected openai, got {prov}"
        assert mod == "gpt-4o-mini", f"Expected gpt-4o-mini, got {mod}"
        assert key == "sk-college-test-key-9999", "Decrypted college key must match"
        print(f"  Step 3B (College config active): Resolved to {scope} ({prov}/{mod}) -> PASS")

        # Step 3C: Configure Student Personal Key -> should resolve to PERSONAL (overriding college)
        personal_config = LLMProviderConfig(
            user_id=test_student.id,
            college_id=test_student.college_id,
            scope="personal",
            provider="gemini",
            model_name="gemini-1.5-flash",
            encrypted_api_key=CryptoService.encrypt_key("AIzaSyPersonalStudentKey1234"),
            is_active=1,
            created_at=datetime.utcnow()
        )
        db.add(personal_config)
        db.commit()

        prov, key, mod, base, scope, col = LLMGateway.resolve_effective_config(
            user_id=test_student.id,
            college_id=test_student.college_id
        )
        assert scope == "PERSONAL", f"Expected PERSONAL, got {scope}"
        assert prov == "gemini", f"Expected gemini, got {prov}"
        assert mod == "gemini-1.5-flash", f"Expected gemini-1.5-flash, got {mod}"
        assert key == "AIzaSyPersonalStudentKey1234", "Decrypted personal key must match"
        print(f"  Step 3C (Personal config active): Resolved to {scope} ({prov}/{mod}) -> PASS")

        # Step 3D: Delete Personal Key -> should revert back to COLLEGE
        db.delete(personal_config)
        db.commit()

        prov, key, mod, base, scope, col = LLMGateway.resolve_effective_config(
            user_id=test_student.id,
            college_id=test_student.college_id
        )
        assert scope == "COLLEGE", f"Expected fallback to COLLEGE, got {scope}"
        print(f"  Step 3D (Personal deleted): Reverted to {scope} ({prov}/{mod}) -> PASS")

        # Step 3E: Delete College Key -> should revert back to PLATFORM_DEFAULT
        db.delete(college_config)
        db.commit()

        prov, key, mod, base, scope, col = LLMGateway.resolve_effective_config(
            user_id=test_student.id,
            college_id=test_student.college_id
        )
        assert scope == "PLATFORM_DEFAULT", f"Expected fallback to PLATFORM_DEFAULT, got {scope}"
        print(f"  Step 3E (College deleted): Reverted to {scope} ({prov}/{mod}) -> PASS")

    finally:
        db.close()

    # 4. Test Provider Test Connection with Invalid/Dummy Keys
    print("\n--- TEST 4: Test Connection & Safe Error Handling ---")
    groq_adapter = LLMProviderFactory.get_provider("groq", api_key="gsk_invalid_test_key_123", model_name="llama-3.3-70b-versatile")
    success, msg, latency = groq_adapter.test_connection()
    assert success is False, "Invalid Groq key should fail test connection"
    assert "gsk_invalid_test_key_123" not in msg, "Error message must never expose the raw key!"
    print(f"  Groq Invalid Key Test: Handled safely -> '{msg}' (latency: {latency}ms)")

    openai_adapter = LLMProviderFactory.get_provider("openai", api_key="sk-invalid_test_key_456", model_name="gpt-4o-mini")
    success, msg, latency = openai_adapter.test_connection()
    assert success is False, "Invalid OpenAI key should fail test connection"
    assert "sk-invalid_test_key_456" not in msg, "Error message must never expose raw secret!"
    print(f"  OpenAI Invalid Key Test: Handled safely -> '{msg}' (latency: {latency}ms)")

    # 5. Test Live Default Platform Groq Call
    print("\n--- TEST 5: Live LLMGateway Execution with Platform Key ---")
    test_json, source = LLMGateway.execute_json(
        agent_name="Test_Runner",
        prompt="Return a JSON with key 'greeting' and value 'hello from study planner'",
        system_prompt="You are a helper bot. Return raw JSON only.",
        user_id=None
    )
    print(f"  LLMGateway execute_json returned source: {source}")
    if test_json:
        print(f"  Response JSON: {test_json[:100]}...")

    # 6. Test Usage Logging
    print("\n--- TEST 6: Usage Logging in SQLite ---")
    db = SessionLocal()
    try:
        latest_log = db.query(AIUsageLog).filter(AIUsageLog.agent_name == "Test_Runner").order_by(AIUsageLog.created_at.desc()).first()
        if latest_log:
            print(f"  Logged entry found: Provider={latest_log.provider}, Model={latest_log.model}, Status={latest_log.status}, Tokens={latest_log.total_tokens}")
            assert latest_log.provider is not None, "Provider must be recorded in log!"
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL MULTI-PROVIDER LLM TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

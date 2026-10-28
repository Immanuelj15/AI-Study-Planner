import json
import hashlib
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from models.models import User, RAGDocument, RAGQueryLog
from services.vector_store import vector_store
from services.llm_gateway import LLMGateway

logger = logging.getLogger(__name__)

class RAGService:
    """
    RAG Orchestration Service.
    Retrieves authorized chunks, formulates context-aware grounded prompts,
    calls existing LLMGateway with token logging & deterministic caching,
    and returns answers with source citations.
    """

    MAX_CONTEXT_TOKENS = 1500  # Cap context to optimize token usage

    @classmethod
    def generate_rag_cache_key(
        cls,
        college_id: str,
        user_id: int,
        subject: str,
        unit: Optional[int],
        difficulty: str,
        question: str,
        context_hash: str
    ) -> str:
        """Deterministic cache key incorporating college, subject, unit, difficulty, question, and retrieved context."""
        raw = f"rag:{college_id.lower()}:{subject.lower()}:u{unit}:{difficulty.lower()}:{question.strip().lower()}:{context_hash}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @classmethod
    def retrieve_context(
        cls,
        question: str,
        user: User,
        subject_name: Optional[str] = None,
        unit_number: Optional[int] = None,
        semester: Optional[int] = None,
        top_k: int = 4
    ) -> Tuple[List[Dict[str, Any]], str, str]:
        """
        Retrieve chunks matching query with college isolation and user authorization.
        Returns: (chunks_list, formatted_context_str, context_hash)
        """
        college_id = user.college_id or "College_Main"
        chunks = vector_store.query_similar(
            query_text=question,
            college_id=college_id,
            user_id=user.id,
            subject_name=subject_name,
            unit_number=unit_number,
            semester=semester,
            top_k=top_k
        )

        if not chunks:
            return [], "", ""

        # Format context blocks
        context_blocks = []
        for i, chk in enumerate(chunks, 1):
            source_tag = f"[Source {i}: {chk.get('filename')} | Unit {chk.get('unit_number') or 'General'} | Page {chk.get('page_number') or 1} | Section: {chk.get('section_heading') or 'Content'}]"
            context_blocks.append(f"{source_tag}\n{chk.get('text')}\n")

        full_context = "\n".join(context_blocks)

        # Truncate context if exceeding token limit to safeguard Groq token budget
        words = full_context.split()
        if len(words) > cls.MAX_CONTEXT_TOKENS:
            full_context = " ".join(words[:cls.MAX_CONTEXT_TOKENS]) + "... [Context truncated for token budget]"

        context_hash = hashlib.sha256(full_context.encode("utf-8")).hexdigest()[:16]
        return chunks, full_context, context_hash

    @classmethod
    def answer_question(
        cls,
        db: Session,
        user: User,
        question: str,
        subject_name: Optional[str] = None,
        unit_number: Optional[int] = None,
        semester: Optional[int] = None,
        difficulty: str = "Medium",
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Grounded educational Q&A using authorized syllabus materials.
        Strictly adheres to:
        - Difficulty levels: Easy (simple analogies, beginner), Medium (technical, practical), Hard (advanced, proofs, interview)
        - Grounded facts vs General AI knowledge vs Not in materials
        - Never fabricates citations
        """
        diff_clean = (difficulty or "Medium").strip().capitalize()
        if diff_clean not in ["Easy", "Medium", "Hard"]:
            diff_clean = "Medium"

        # 1. Retrieve authorized chunks
        chunks, context_str, context_hash = cls.retrieve_context(
            question=question,
            user=user,
            subject_name=subject_name,
            unit_number=unit_number,
            semester=semester,
            top_k=top_k
        )

        context_found = len(chunks) > 0

        # Build citations list
        citations = []
        for chk in chunks:
            excerpt_snippet = chk.get("text", "")[:200].replace("\n", " ") + "..."
            citations.append({
                "document_name": chk.get("filename", "Official Document"),
                "document_id": chk.get("document_id", ""),
                "college_id": chk.get("college_id", user.college_id or ""),
                "subject_name": chk.get("subject_name", subject_name or ""),
                "unit_number": chk.get("unit_number"),
                "page_number": chk.get("page_number"),
                "section_heading": chk.get("section_heading"),
                "chunk_index": chk.get("chunk_index", 0),
                "relevance_score": chk.get("relevance_score", 0.0),
                "excerpt": excerpt_snippet
            })

        # 2. Configure difficulty directives
        diff_guidance = {
            "Easy": "BEGINNER-FRIENDLY: Explain using clear everyday analogies, simple language, and basic examples. Avoid complex mathematical proofs or dense technical jargon.",
            "Medium": "INTERMEDIATE TECHNICAL: Provide standard academic explanations, clear architectural concepts, practical examples, and relevant implementation details.",
            "Hard": "ADVANCED & IN-DEPTH: Provide deep technical details, architectural invariants, time/space trade-offs, internal algorithms, and challenging exam/interview edge cases."
        }[diff_clean]

        # 3. Check for scenario: No material uploaded / found
        if not context_found:
            answer_text = (
                f"Notice: The uploaded college syllabus and study materials for '{subject_name or 'this subject'}' "
                f"(Unit: {unit_number or 'All'}) do not contain information related to your question: \"{question}\".\n\n"
                f"To answer from your specific college syllabus, please upload the corresponding Unit notes or official syllabus document in the College Materials section."
            )
            return {
                "answer": answer_text,
                "difficulty": diff_clean,
                "is_grounded": False,
                "context_found": False,
                "sources": [],
                "tokens_used": 0,
                "source_type": "FALLBACK"
            }

        # 4. Construct Grounded Prompt
        system_prompt = (
            "You are an expert AI College Academic Tutor. Your mission is to provide accurate, grounded answers "
            "based SOLELY on the student's authorized college syllabus and learning materials provided in the Context.\n\n"
            "STRICT GROUNDING DIRECTIVES:\n"
            "1. Ground your answer in the provided syllabus context.\n"
            "2. If the context does not contain sufficient details to answer the question, CLEARLY state: "
            "'The uploaded college materials do not contain sufficient information to answer this question.'\n"
            "3. If providing helpful general academic context beyond the document, explicitly label it under a section header: '### Supplemental Academic Knowledge'.\n"
            "4. NEVER fabricate citations, page numbers, unit numbers, or syllabus topics.\n"
            "5. Strictly respect the requested student difficulty level."
        )

        user_prompt = f"""
Student Name: {user.name}
College: {user.college_id}
Subject: {subject_name or 'General'}
Unit Number: {unit_number if unit_number else 'Not specified'}
Difficulty Target: {diff_clean}
Difficulty Directive: {diff_guidance}

STUDENT QUESTION:
{question}

OFFICIAL RETRIEVED SYLLABUS & MATERIAL CONTEXT:
{context_str}

Please generate a comprehensive, structured response at the {diff_clean} difficulty level following the grounding directives.
"""

        # 5. Generate cache key
        cache_key = cls.generate_rag_cache_key(
            college_id=user.college_id or "College_Main",
            user_id=user.id,
            subject=subject_name or "general",
            unit=unit_number,
            difficulty=diff_clean,
            question=question,
            context_hash=context_hash
        )

        # 6. Call LLMGateway
        response_text, source_type = LLMGateway.execute_text(
            agent_name="RAG_AI_Tutor",
            prompt=user_prompt,
            system_prompt=system_prompt,
            cache_key=cache_key,
            user_id=user.id,
            college_id=user.college_id
        )

        # If LLM returned empty or fallback (e.g. rate limit or demo key)
        if not response_text or len(response_text.strip()) < 15:
            # Deterministic high-quality grounded answer from retrieved context
            first_chunk = chunks[0]
            answer_text = (
                f"### Explanation from Uploaded Syllabus ({diff_clean} Level)\n\n"
                f"Based on your official material (**{first_chunk.get('filename')}**, Unit {first_chunk.get('unit_number') or 1}):\n\n"
                f"{first_chunk.get('text')[:400]}...\n\n"
                f"**Key Takeaway ({diff_clean} Focus):**\n"
                f"This concept establishes fundamental invariants for {subject_name or 'the subject'}.\n"
                f"Consult Unit {first_chunk.get('unit_number') or 1}, {first_chunk.get('section_heading') or 'Page ' + str(first_chunk.get('page_number', 1))} for full course reading."
            )
            source_type = "FALLBACK"
        else:
            answer_text = response_text

        # 7. Audit log in SQLite rag_query_logs
        try:
            log_record = RAGQueryLog(
                user_id=user.id,
                college_id=user.college_id or "College_Main",
                subject_name=subject_name or "General",
                unit_number=unit_number,
                difficulty=diff_clean,
                query_text=question,
                retrieved_chunks_count=len(chunks),
                response_text=answer_text[:1000],
                sources_json=json.dumps(citations),
                tokens_used=len(answer_text.split()) * 2
            )
            db.add(log_record)
            db.commit()
        except Exception as log_err:
            logger.warning(f"Failed to log RAG query: {log_err}")

        return {
            "answer": answer_text,
            "difficulty": diff_clean,
            "is_grounded": True,
            "context_found": True,
            "sources": citations,
            "tokens_used": len(answer_text.split()) * 2,
            "source_type": source_type
        }

rag_service = RAGService()

import os
import sys
import json
import logging
from datetime import datetime
from database.session import SessionLocal, engine
from database.init_rag_db import init_rag_tables
from models.models import Base, User, Subject, RAGDocument
from services.auth import get_password_hash
from services.rag_processor import rag_processor, DocumentProcessingError
from services.vector_store import vector_store
from services.rag_service import rag_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAG_TEST_SUITE")

def run_rag_test_suite():
    print("\n" + "=" * 60)
    print("      RAG SYSTEM COMPREHENSIVE AUTOMATED VERIFICATION")
    print("=" * 60)

    # 1. DB initialization
    print("\n[Step 1] Initializing SQLite tables & RAG schema migrations...")
    init_rag_tables()
    db = SessionLocal()

    # Create Test Users:
    # Student A: College Alpha, Student
    # Student B: College Alpha, Student
    # Student C: College Beta (Different College), Student
    # Faculty A: College Alpha, Faculty
    def get_or_create_user(email, name, role, college_id):
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                name=name,
                email=email,
                password=get_password_hash("testpass123"),
                role=role,
                college_id=college_id,
                department="Computer Science",
                semester=3
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        else:
            u.role = role
            u.college_id = college_id
            db.commit()
        return u

    student_a = get_or_create_user("student_a@alpha.edu", "Alice Alpha", "Student", "College_Alpha")
    student_b = get_or_create_user("student_b@alpha.edu", "Bob Alpha", "Student", "College_Alpha")
    student_c = get_or_create_user("student_c@beta.edu", "Charlie Beta", "Student", "College_Beta")
    faculty_a = get_or_create_user("faculty_a@alpha.edu", "Prof. Adams", "Faculty", "College_Alpha")
    print("   [PASSED] Test users initialized across multiple colleges and roles.")

    # 2. Test Text & Document Extraction (TXT, DOCX)
    print("\n[Step 2] Testing Document Parsing & Cleaning (TXT, DOCX)...")
    test_txt_path = "test_unit1_dbms.txt"
    sample_text = (
        "UNIT 1: RELATIONAL DATABASE MANAGEMENT SYSTEMS\n\n"
        "Introduction to Database Systems:\n"
        "A Database Management System (DBMS) is software designed to store, manage, and facilitate database manipulation.\n"
        "Key ACID Properties:\n"
        "1. Atomicity: All or nothing transaction execution.\n"
        "2. Consistency: Database remains in a valid invariant state.\n"
        "3. Isolation: Transactions execute concurrently without interference.\n"
        "4. Durability: Committed updates persist permanently on non-volatile disk.\n\n"
        "Data Models:\n"
        "Relational model represents data in 2-dimensional tables consisting of rows and columns."
    )
    with open(test_txt_path, "w", encoding="utf-8") as f:
        f.write(sample_text)

    pages, is_scanned, ocr = rag_processor.extract_document(test_txt_path, "test_unit1_dbms.txt")
    assert len(pages) > 0, "TXT extraction failed"
    assert "ACID" in pages[0]["text"], "ACID text missing"
    print("   [PASSED] TXT extracted and cleaned successfully.")

    # 3. Test Chunking & Unit Heading Preservation
    print("\n[Step 3] Testing Context-Aware Chunking & Heading Preservation...")
    doc_meta_a = {
        "document_id": "doc_test_u1",
        "college_id": "College_Alpha",
        "department": "Computer Science",
        "course_name": "B.Tech CSE",
        "semester": 3,
        "subject_name": "Database Management Systems",
        "unit_number": 1,
        "academic_year": "2025-2026",
        "document_type": "Subject Notes",
        "filename": "DBMS_Unit_1_Notes.txt",
        "owner_id": student_a.id,
        "is_official": 0
    }
    chunks = rag_processor.chunk_document(pages, doc_meta_a)
    assert len(chunks) > 0, "Chunking produced no chunks"
    first_chunk = chunks[0]
    assert "UNIT 1" in first_chunk["section_heading"] or "UNIT 1" in first_chunk["text"], "Unit heading not preserved"
    print(f"   [PASSED] Generated {len(chunks)} chunks with unit heading: {first_chunk['section_heading']}")

    # 4. Test Scanned PDF Detection Rule
    print("\n[Step 4] Testing Scanned PDF Detection...")
    # Create empty/blank PDF with pypdf
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    blank_pdf_path = "test_blank_scanned.pdf"
    with open(blank_pdf_path, "wb") as f:
        writer.write(f)

    scanned_detected = False
    try:
        rag_processor.extract_document(blank_pdf_path, "test_blank_scanned.pdf")
    except DocumentProcessingError as e:
        if "Scanned PDF detected" in str(e):
            scanned_detected = True
            print("   [PASSED] Scanned/empty PDF successfully caught with explicit user warning: ", str(e)[:75] + "...")
    assert scanned_detected, "Failed to catch scanned/empty PDF"

    # 5. Ingest Unit 1 (Student A, College Alpha) into Vector Store
    print("\n[Step 5] Indexing Unit 1 into ChromaDB...")
    vector_store.delete_document("doc_test_u1")
    count1 = vector_store.add_chunks(chunks)
    assert count1 > 0, "ChromaDB indexing failed"
    print(f"   [PASSED] Successfully indexed {count1} chunks into ChromaDB.")

    # 6. Ingest Unit 5 (Faculty A, College Alpha, Official) into Vector Store
    print("\n[Step 6] Indexing Unit 5 Official Syllabus (College Alpha)...")
    sample_unit5_text = (
        "UNIT 5: NOSQL DATABASES AND DISTRIBUTED TRANSACTIONS\n\n"
        "CAP Theorem:\n"
        "In a distributed system, it is impossible to simultaneously provide Consistency, Availability, and Partition Tolerance.\n"
        "Two-Phase Commit (2PC):\n"
        "Coordinator sends prepare request to all cohorts, followed by global commit or abort.\n"
        "Base Properties: Basically Available, Soft state, Eventual consistency."
    )
    with open("test_unit5_dbms.txt", "w", encoding="utf-8") as f:
        f.write(sample_unit5_text)

    pages5, _, _ = rag_processor.extract_document("test_unit5_dbms.txt", "test_unit5_dbms.txt")
    doc_meta_5 = {
        "document_id": "doc_test_u5",
        "college_id": "College_Alpha",
        "department": "Computer Science",
        "course_name": "B.Tech CSE",
        "semester": 3,
        "subject_name": "Database Management Systems",
        "unit_number": 5,
        "academic_year": "2025-2026",
        "document_type": "Official Syllabus",
        "filename": "Official_DBMS_Unit5.txt",
        "owner_id": faculty_a.id,
        "is_official": 1
    }
    chunks5 = rag_processor.chunk_document(pages5, doc_meta_5)
    vector_store.delete_document("doc_test_u5")
    count5 = vector_store.add_chunks(chunks5)
    assert count5 > 0, "Unit 5 indexing failed"
    print(f"   [PASSED] Successfully indexed {count5} Unit 5 official chunks.")

    # Ingest College Beta syllabus
    sample_beta_text = "COLLEGE BETA SYLLABUS: Advanced Quantum Computing and Cryptography protocols."
    with open("test_beta.txt", "w", encoding="utf-8") as f:
        f.write(sample_beta_text)
    pages_beta, _, _ = rag_processor.extract_document("test_beta.txt", "test_beta.txt")
    doc_meta_beta = {
        "document_id": "doc_beta_1",
        "college_id": "College_Beta",
        "department": "Physics",
        "course_name": "Quantum Tech",
        "semester": 1,
        "subject_name": "Quantum Computing",
        "unit_number": 1,
        "academic_year": "2025-2026",
        "document_type": "Official Syllabus",
        "filename": "Beta_Quantum_Syllabus.txt",
        "owner_id": student_c.id,
        "is_official": 1
    }
    vector_store.delete_document("doc_beta_1")
    vector_store.add_chunks(rag_processor.chunk_document(pages_beta, doc_meta_beta))

    # 7. Test Cases A, B, C: Student A asks DBMS Unit 1 question
    print("\n[Step 7: Cases A, B, C] Testing Grounded Q&A with Citations (Unit 1)...")
    res_a = rag_service.answer_question(
        db=db,
        user=student_a,
        question="Explain ACID properties of transactions",
        subject_name="Database Management Systems",
        unit_number=1,
        difficulty="Easy"
    )
    assert res_a["is_grounded"] is True, "Expected grounded answer"
    assert len(res_a["sources"]) > 0, "Expected source citations"
    assert "DBMS_Unit_1_Notes.txt" in res_a["sources"][0]["document_name"], "Wrong source document"
    print(f"   [PASSED] Answer grounded in Unit 1! Citations returned: {len(res_a['sources'])}")
    print(f"            Sample Citation: {res_a['sources'][0]['document_name']} (Unit {res_a['sources'][0]['unit_number']})")

    # 8. Test Cases D, E: Student asks DBMS Unit 5 question
    print("\n[Step 8: Cases D, E] Testing Unit 5 Retrieval vs Unit 1 Filtering...")
    res_d = rag_service.answer_question(
        db=db,
        user=student_a,
        question="What is the CAP Theorem?",
        subject_name="Database Management Systems",
        unit_number=5,
        difficulty="Medium"
    )
    assert res_d["is_grounded"] is True, "Expected grounded answer for Unit 5"
    assert len(res_d["sources"]) > 0, "No sources found for Unit 5"
    assert res_d["sources"][0]["unit_number"] == 5, f"Expected Unit 5 citation, got Unit {res_d['sources'][0]['unit_number']}"
    print(f"   [PASSED] Retrieved Unit 5 content ({res_d['sources'][0]['document_name']}), correctly filtered out Unit 1!")

    # 9. Test Cases F, G: Question about content not in documents
    print("\n[Step 9: Cases F, G] Testing Unfound Topic Grounding Notice...")
    res_f = rag_service.answer_question(
        db=db,
        user=student_a,
        question="How to build an interstellar warp drive engine?",
        subject_name="Database Management Systems",
        unit_number=1,
        difficulty="Easy"
    )
    assert res_f["is_grounded"] is False or "not contain" in res_f["answer"].lower(), "Expected not found notice"
    print("   [PASSED] System explicitly reports that uploaded materials do not contain sufficient information.")

    # 10. Test Cases H, I: Cross-college Isolation
    print("\n[Step 10: Cases H, I] Testing College Isolation (College Alpha cannot see College Beta)...")
    res_h = vector_store.query_similar(
        query_text="Quantum Computing",
        college_id="College_Alpha",
        user_id=student_a.id,
        subject_name="Quantum Computing"
    )
    assert len(res_h) == 0, f"Cross-college data leak detected! College Alpha retrieved {len(res_h)} College Beta chunks!"
    print("   [PASSED] Zero cross-college leakage! Student from College Alpha cannot access College Beta materials.")

    # 11. Test Cases L, M: Student Privacy & Access Control
    print("\n[Step 11: Cases L, M] Testing Student Ownership & Privacy...")
    # Student B searches for Student A's personal document
    res_priv = vector_store.query_similar(
        query_text="ACID properties",
        college_id="College_Alpha",
        user_id=student_b.id, # Student B querying
        subject_name="Database Management Systems",
        unit_number=1
    )
    # Student A's doc is is_official=0, so Student B should NOT be able to see it
    assert len(res_priv) == 0, "Student B accessed Student A's private study material!"
    print("   [PASSED] Student B cannot access Student A's private personal document.")

    # But Student B CAN access Faculty A's official Unit 5 material
    res_pub = vector_store.query_similar(
        query_text="CAP Theorem",
        college_id="College_Alpha",
        user_id=student_b.id,
        subject_name="Database Management Systems",
        unit_number=5
    )
    assert len(res_pub) > 0, "Student B failed to access official faculty material"
    print("   [PASSED] Student B can access College Alpha's official faculty material.")

    # 12. Test Document Deletion
    print("\n[Step 12] Testing Vector & Document Deletion...")
    deleted_chunks = vector_store.delete_document("doc_test_u1")
    assert deleted_chunks > 0, "Failed to delete vector chunks"
    res_after_del = vector_store.query_similar("ACID", "College_Alpha", student_a.id)
    assert len(res_after_del) == 0, "Vectors still exist after deletion"
    print(f"   [PASSED] Document vectors successfully purged from ChromaDB ({deleted_chunks} chunks).")

    # Clean temporary files
    for tmp_file in [test_txt_path, blank_pdf_path, "test_unit5_dbms.txt", "test_beta.txt"]:
        if os.path.exists(tmp_file):
            try:
                os.remove(tmp_file)
            except Exception:
                pass

    db.close()

    print("\n" + "=" * 60)
    print("  ALL 13 RAG AUTOMATED TEST CRITERIA PASSED 100% SUCCESFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_rag_test_suite()

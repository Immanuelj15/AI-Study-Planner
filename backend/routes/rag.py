import os
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User, Subject, RAGDocument, RAGQueryLog
from schemas.rag_schemas import (
    RAGDocumentUploadResponse, RAGDocumentItem,
    RAGQueryRequest, RAGQueryResponse, RAGHealthResponse
)
from services.auth import get_current_user
from services.rag_processor import rag_processor, DocumentProcessingError
from services.vector_store import vector_store
from services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rag", tags=["RAG (Retrieval-Augmented Generation)"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploaded_documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB limit

@router.post("/documents/upload", response_model=RAGDocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    subject_name: str = Form(...),
    college_id: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    course_name: Optional[str] = Form(None),
    semester: Optional[int] = Form(None),
    unit_number: Optional[int] = Form(None),
    academic_year: Optional[str] = Form(None),
    document_type: str = Form("Syllabus"),
    is_official: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and process college syllabus, subject notes, or study materials.
    Validates file format, size, content, user roles, and access boundaries.
    """
    # 1. Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, TXT."
        )

    # 2. Determine and validate user role & official status
    effective_college_id = (college_id or current_user.college_id or "College_Main").strip()
    is_admin_or_faculty = current_user.role in ["Faculty", "College Admin"]

    # Only Faculty or Admin can publish official syllabus
    effective_is_official = 1 if (is_official and is_admin_or_faculty) else 0

    # 3. Read content and validate size
    try:
        file_bytes = file.file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    file_size = len(file_bytes)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of 25MB.")

    # 4. Generate stable document ID and save to local storage
    doc_uuid = f"doc_{uuid.uuid4().hex[:12]}"
    safe_filename = f"{doc_uuid}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # 5. Find or associate subject_id if matches existing user subject
    matched_subject = db.query(Subject).filter(
        Subject.user_id == current_user.id,
        Subject.subject_name.ilike(subject_name.strip())
    ).first()
    subject_id_val = matched_subject.id if matched_subject else None

    # 6. Create initial RAGDocument record with 'Processing' status
    doc_record = RAGDocument(
        document_id=doc_uuid,
        owner_id=current_user.id,
        college_id=effective_college_id,
        department=department or current_user.department or "Computer Science",
        course_name=course_name or "Engineering",
        semester=semester or current_user.semester or 1,
        subject_id=subject_id_val,
        subject_name=subject_name.strip(),
        unit_number=unit_number,
        academic_year=academic_year or "2025-2026",
        document_type=document_type,
        filename=file.filename,
        file_path=file_path,
        file_size_bytes=file_size,
        processing_status="Processing",
        is_official=effective_is_official
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # 7. Extract, Clean, and Chunk document
    try:
        pages, is_scanned, ocr_applied = rag_processor.extract_document(file_path, file.filename)
        doc_record.is_scanned_pdf = 1 if is_scanned else 0
        doc_record.ocr_applied = 1 if ocr_applied else 0

        metadata_dict = {
            "document_id": doc_uuid,
            "college_id": effective_college_id,
            "department": doc_record.department,
            "course_name": doc_record.course_name,
            "semester": doc_record.semester,
            "subject_id": doc_record.subject_id,
            "subject_name": doc_record.subject_name,
            "unit_number": doc_record.unit_number,
            "academic_year": doc_record.academic_year,
            "document_type": doc_record.document_type,
            "filename": doc_record.filename,
            "owner_id": current_user.id,
            "is_official": effective_is_official
        }

        chunks = rag_processor.chunk_document(pages, metadata_dict)
        if not chunks:
            raise DocumentProcessingError("No extractable chunks found in document.")

        # 8. Index chunks into ChromaDB
        indexed_count = vector_store.add_chunks(chunks)

        # 9. Update DB record to Ready
        doc_record.total_chunks = indexed_count
        doc_record.processing_status = "Ready"
        doc_record.error_message = None
        db.commit()
        db.refresh(doc_record)

        return {
            "document_id": doc_uuid,
            "filename": file.filename,
            "subject_name": doc_record.subject_name,
            "unit_number": doc_record.unit_number,
            "semester": doc_record.semester,
            "college_id": doc_record.college_id,
            "document_type": doc_record.document_type,
            "is_official": bool(effective_is_official),
            "processing_status": "Ready",
            "total_chunks": indexed_count,
            "message": f"Document processed and {indexed_count} chunks indexed successfully."
        }

    except DocumentProcessingError as pe:
        logger.error(f"Processing error for {doc_uuid}: {pe}")
        doc_record.processing_status = "Failed"
        doc_record.error_message = str(pe)
        db.commit()
        raise HTTPException(status_code=422, detail=str(pe))
    except Exception as e:
        logger.error(f"Unexpected error processing {doc_uuid}: {e}")
        doc_record.processing_status = "Failed"
        doc_record.error_message = f"Processing failed: {str(e)}"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Internal document ingestion error: {e}")


@router.get("/documents", response_model=List[RAGDocumentItem])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all documents accessible to the student:
    1. Official college syllabus & materials (college_id == user.college_id and is_official == 1)
    2. Personal study materials uploaded by this student (owner_id == user.id)
    """
    college_id = current_user.college_id or "College_Main"
    docs = db.query(RAGDocument).filter(
        (RAGDocument.owner_id == current_user.id) |
        ((RAGDocument.college_id == college_id) & (RAGDocument.is_official == 1))
    ).order_by(RAGDocument.upload_date.desc()).all()

    return docs


@router.get("/documents/{document_id}", response_model=RAGDocumentItem)
def get_document_detail(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of a specific document with access validation."""
    doc = db.query(RAGDocument).filter(RAGDocument.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Access control
    is_owner = doc.owner_id == current_user.id
    is_same_college_official = (doc.college_id == current_user.college_id and doc.is_official == 1)
    if not (is_owner or is_same_college_official):
        raise HTTPException(status_code=403, detail="Access denied. You do not have permission to view this document.")

    return doc


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Safely delete a document, its physical file, and its ChromaDB vector chunks.
    Ensures students cannot delete another user's documents.
    """
    doc = db.query(RAGDocument).filter(RAGDocument.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    is_owner = doc.owner_id == current_user.id
    is_admin = current_user.role in ["College Admin"]
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Unauthorized: You cannot delete another user's document.")

    # 1. Delete vectors from ChromaDB
    vector_store.delete_document(document_id)

    # 2. Delete physical file if exists
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.warning(f"Could not remove file {doc.file_path}: {e}")

    # 3. Delete DB record
    db.delete(doc)
    db.commit()

    return {"status": "success", "message": f"Document '{doc.filename}' and all associated vectors deleted successfully."}


@router.post("/documents/{document_id}/reprocess")
def reprocess_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reprocess a failed or modified document from scratch."""
    doc = db.query(RAGDocument).filter(RAGDocument.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    is_owner = doc.owner_id == current_user.id
    is_admin = current_user.role in ["Faculty", "College Admin"]
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Unauthorized: You cannot reprocess this document.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Original document file missing on server.")

    # Delete existing vectors first
    vector_store.delete_document(document_id)

    doc.processing_status = "Processing"
    doc.error_message = None
    db.commit()

    try:
        pages, is_scanned, ocr_applied = rag_processor.extract_document(doc.file_path, doc.filename)
        doc.is_scanned_pdf = 1 if is_scanned else 0
        doc.ocr_applied = 1 if ocr_applied else 0

        metadata_dict = {
            "document_id": doc.document_id,
            "college_id": doc.college_id,
            "department": doc.department,
            "course_name": doc.course_name,
            "semester": doc.semester,
            "subject_id": doc.subject_id,
            "subject_name": doc.subject_name,
            "unit_number": doc.unit_number,
            "academic_year": doc.academic_year,
            "document_type": doc.document_type,
            "filename": doc.filename,
            "owner_id": doc.owner_id,
            "is_official": doc.is_official
        }

        chunks = rag_processor.chunk_document(pages, metadata_dict)
        indexed_count = vector_store.add_chunks(chunks)

        doc.total_chunks = indexed_count
        doc.processing_status = "Ready"
        db.commit()

        return {"status": "success", "message": f"Reprocessed successfully. {indexed_count} chunks indexed."}

    except Exception as e:
        doc.processing_status = "Failed"
        doc.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=422, detail=f"Reprocessing failed: {e}")


@router.post("/query", response_model=RAGQueryResponse)
def query_rag(
    req: RAGQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    RAG-powered educational query endpoint.
    Retrieves authorized chunks from the student's college syllabus,
    constructs grounded prompt, invokes existing LLMGateway, and returns
    grounded answer with source citations.
    """
    response_data = rag_service.answer_question(
        db=db,
        user=current_user,
        question=req.question,
        subject_name=req.subject_name,
        unit_number=req.unit_number,
        semester=req.semester,
        difficulty=req.difficulty or "Medium",
        top_k=req.top_k or 4
    )
    return response_data


@router.get("/subjects")
def get_available_rag_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch distinct subjects available in uploaded materials for this student's college."""
    college_id = current_user.college_id or "College_Main"
    docs = db.query(RAGDocument.subject_name).filter(
        (RAGDocument.owner_id == current_user.id) |
        ((RAGDocument.college_id == college_id) & (RAGDocument.is_official == 1))
    ).filter(RAGDocument.processing_status == "Ready").distinct().all()

    subjects = sorted(list(set(d[0] for d in docs if d[0])))
    return {"subjects": subjects}


@router.get("/units")
def get_available_rag_units(
    subject_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch distinct unit numbers available for a subject."""
    college_id = current_user.college_id or "College_Main"
    docs = db.query(RAGDocument.unit_number).filter(
        (RAGDocument.owner_id == current_user.id) |
        ((RAGDocument.college_id == college_id) & (RAGDocument.is_official == 1))
    ).filter(
        RAGDocument.subject_name.ilike(subject_name.strip()),
        RAGDocument.processing_status == "Ready",
        RAGDocument.unit_number != None
    ).distinct().all()

    units = sorted(list(set(d[0] for d in docs if d[0])))
    return {"subject": subject_name, "units": units}


@router.get("/health", response_model=RAGHealthResponse)
def get_rag_health(db: Session = Depends(get_db)):
    """Health check for RAG subsystem, ChromaDB, and document count."""
    stats = vector_store.get_stats()
    total_docs = db.query(RAGDocument).count()
    return {
        "status": "healthy",
        "chroma_db_status": stats.get("status", "unknown"),
        "embedding_model": "all-MiniLM-L6-v2 (Local ONNX/Sentence-Transformers)",
        "total_documents": total_docs,
        "total_chunks_indexed": stats.get("total_chunks_indexed", 0)
    }

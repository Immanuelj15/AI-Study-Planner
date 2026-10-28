from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class RAGDocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    subject_name: str
    unit_number: Optional[int] = None
    semester: Optional[int] = None
    college_id: str
    document_type: str
    is_official: bool
    processing_status: str
    total_chunks: int
    message: str

class RAGDocumentItem(BaseModel):
    id: int
    document_id: str
    owner_id: int
    college_id: str
    department: Optional[str] = None
    course_name: Optional[str] = None
    semester: Optional[int] = None
    subject_id: Optional[int] = None
    subject_name: str
    unit_number: Optional[int] = None
    academic_year: Optional[str] = None
    document_type: str
    filename: str
    file_size_bytes: int
    upload_date: datetime
    processing_status: str
    error_message: Optional[str] = None
    total_chunks: int
    is_official: int
    is_scanned_pdf: int

    class Config:
        from_attributes = True

class SourceCitation(BaseModel):
    document_name: str
    document_id: str
    college_id: str
    subject_name: str
    unit_number: Optional[int] = None
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    chunk_index: int
    relevance_score: float = 0.0
    excerpt: str

class RAGQueryRequest(BaseModel):
    question: str
    subject_name: Optional[str] = None
    unit_number: Optional[int] = None
    semester: Optional[int] = None
    difficulty: Optional[str] = "Medium" # Easy, Medium, Hard
    top_k: Optional[int] = 4

class RAGQueryResponse(BaseModel):
    answer: str
    difficulty: str
    is_grounded: bool
    context_found: bool
    sources: List[SourceCitation]
    tokens_used: int = 0
    source_type: str = "RAG_GROQ" # RAG_GROQ, CACHE, FALLBACK

class RAGHealthResponse(BaseModel):
    status: str
    chroma_db_status: str
    embedding_model: str
    total_documents: int
    total_chunks_indexed: int

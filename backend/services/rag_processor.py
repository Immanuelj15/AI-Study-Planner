import os
import re
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

class DocumentProcessingError(Exception):
    pass

class RAGProcessor:
    """
    Document parser, cleaner, scanned PDF detector, and context-aware chunker.
    Extracts text from PDF, DOCX, TXT while preserving unit headers, page numbers, and sections.
    """

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        self.chunk_size = chunk_size  # words approx ~600 words (~2400 chars)
        self.chunk_overlap = chunk_overlap

    def clean_text(self, text: str) -> str:
        """Clean unnecessary whitespace, null bytes, and normalize line endings."""
        if not text:
            return ""
        # Remove null bytes
        text = text.replace("\x00", "")
        # Normalize newlines
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Collapse multiple empty lines
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Normalize tabs and multiple spaces within lines
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def extract_from_txt(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from TXT file with page/section structure."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                content = f.read()

        cleaned = self.clean_text(content)
        if not cleaned:
            raise DocumentProcessingError("TXT file is empty.")

        return [{
            "text": cleaned,
            "page_number": 1,
            "section_heading": "Document Content"
        }]

    def extract_from_docx(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from DOCX preserving headings and tables."""
        try:
            import docx
            doc = docx.Document(file_path)
        except Exception as e:
            raise DocumentProcessingError(f"Failed to open DOCX file: {e}")

        pages_or_sections = []
        current_heading = "General"
        current_paragraphs = []

        # Iterate through paragraphs
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            # Check if this paragraph is a heading or Unit title
            style_name = para.style.name.lower() if para.style else ""
            is_heading = "heading" in style_name or re.match(r"^(UNIT|CHAPTER|MODULE|SECTION)\s+[0-9IVX]+", text, re.IGNORECASE)

            if is_heading:
                if current_paragraphs:
                    pages_or_sections.append({
                        "text": self.clean_text("\n".join(current_paragraphs)),
                        "page_number": len(pages_or_sections) + 1,
                        "section_heading": current_heading
                    })
                    current_paragraphs = []
                current_heading = text

            current_paragraphs.append(text)

        # Extract table contents as structured text
        for table in doc.tables:
            table_rows = []
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells]
                table_rows.append(" | ".join(cells))
            if table_rows:
                current_paragraphs.append("Table Data:\n" + "\n".join(table_rows))

        if current_paragraphs:
            pages_or_sections.append({
                "text": self.clean_text("\n".join(current_paragraphs)),
                "page_number": len(pages_or_sections) + 1,
                "section_heading": current_heading
            })

        if not pages_or_sections:
            raise DocumentProcessingError("No extractable text found in DOCX file.")

        return pages_or_sections

    def extract_from_pdf(self, file_path: str) -> Tuple[List[Dict[str, Any]], bool, bool]:
        """
        Extract text from PDF using pypdf / pdfplumber.
        Detects scanned PDFs.
        Returns: (extracted_pages, is_scanned_pdf, ocr_applied)
        """
        extracted_pages = []
        total_pages = 0
        total_characters = 0

        # Primary extraction using pypdf
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            total_pages = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                cleaned = self.clean_text(page_text)
                total_characters += len(cleaned)
                if cleaned:
                    extracted_pages.append({
                        "text": cleaned,
                        "page_number": idx + 1,
                        "section_heading": f"Page {idx + 1}"
                    })
        except Exception as e:
            logger.warning(f"pypdf extraction notice on {file_path}: {e}")

        # Fallback to pdfplumber if pypdf got very little text
        if total_characters < 100:
            try:
                import pdfplumber
                with pdfplumber.open(file_path) as pdf:
                    total_pages = len(pdf.pages)
                    extracted_pages = []
                    total_characters = 0
                    for idx, page in enumerate(pdf.pages):
                        page_text = page.extract_text() or ""
                        cleaned = self.clean_text(page_text)
                        total_characters += len(cleaned)
                        if cleaned:
                            extracted_pages.append({
                                "text": cleaned,
                                "page_number": idx + 1,
                                "section_heading": f"Page {idx + 1}"
                            })
            except Exception as e:
                logger.warning(f"pdfplumber fallback notice on {file_path}: {e}")

        # Check if scanned PDF (pages exist, but practically zero text)
        if total_pages > 0 and total_characters < (total_pages * 25):
            # Scanned PDF detected!
            is_scanned = True
            ocr_success = False

            # Try Tesseract OCR if available
            try:
                import pytesseract
                from PIL import Image
                import pypdfium2

                pdf_doc = pypdfium2.PdfDocument(file_path)
                ocr_pages = []
                for idx, page in enumerate(pdf_doc):
                    pix = page.render(scale=2.0).to_pil()
                    text = pytesseract.image_to_string(pix)
                    cleaned = self.clean_text(text)
                    if cleaned:
                        ocr_pages.append({
                            "text": cleaned,
                            "page_number": idx + 1,
                            "section_heading": f"Page {idx + 1} (OCR)"
                        })

                if ocr_pages and sum(len(p["text"]) for p in ocr_pages) > 100:
                    return ocr_pages, True, True
            except Exception as ocr_err:
                logger.warning(f"Tesseract OCR attempt failed: {ocr_err}")

            # If OCR failed or not available, do not silently pretend text was extracted!
            raise DocumentProcessingError(
                "Scanned PDF detected! This document contains images without a readable text layer. "
                "Optical Character Recognition (OCR) is required to process scanned pages. "
                "Please upload a searchable text-based PDF or run OCR before uploading."
            )

        if not extracted_pages:
            raise DocumentProcessingError("PDF contains no extractable text or is empty.")

        return extracted_pages, False, False

    def extract_document(self, file_path: str, filename: str) -> Tuple[List[Dict[str, Any]], bool, bool]:
        """Auto-detect format and extract text with section metadata."""
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            return self.extract_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            pages = self.extract_from_docx(file_path)
            return pages, False, False
        elif ext in [".txt", ".md"]:
            pages = self.extract_from_txt(file_path)
            return pages, False, False
        else:
            raise DocumentProcessingError(f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, TXT.")

    def chunk_document(
        self,
        extracted_pages: List[Dict[str, Any]],
        doc_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Split extracted pages into semantic chunks while preserving unit headings,
        section information, page numbers, and source metadata.
        """
        chunks = []
        chunk_counter = 0

        # Pattern to detect Unit / Chapter headings in text
        unit_regex = re.compile(r"(UNIT\s*[-–:]*\s*[0-9IVX]+[:\s\w\(\)]*|CHAPTER\s*[0-9]+[:\s\w\(\)]*|MODULE\s*[0-9]+)", re.IGNORECASE)

        for page in extracted_pages:
            raw_text = page["text"]
            page_num = page.get("page_number", 1)
            active_section = page.get("section_heading", f"Page {page_num}")

            # Check if there is an explicit Unit heading inside the page text
            unit_match = unit_regex.search(raw_text)
            if unit_match:
                active_section = unit_match.group(0).strip()[:100]

            # Split by paragraphs or double newlines first
            paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]

            current_chunk_words = []
            current_chunk_len = 0

            for para in paragraphs:
                words = para.split()
                if not words:
                    continue

                # Check if paragraph itself introduces a new unit heading
                para_unit_match = unit_regex.match(para)
                if para_unit_match:
                    active_section = para_unit_match.group(0).strip()[:100]

                if current_chunk_len + len(words) <= self.chunk_size:
                    current_chunk_words.extend(words)
                    current_chunk_len += len(words)
                else:
                    # Flush current chunk
                    if current_chunk_words:
                        chunk_text = " ".join(current_chunk_words)
                        chunk_id = f"{doc_metadata.get('document_id')}_chk_{chunk_counter}"
                        chunks.append({
                            "chunk_id": chunk_id,
                            "document_id": doc_metadata.get("document_id"),
                            "college_id": doc_metadata.get("college_id"),
                            "department": doc_metadata.get("department"),
                            "course_name": doc_metadata.get("course_name"),
                            "semester": doc_metadata.get("semester"),
                            "subject_id": doc_metadata.get("subject_id"),
                            "subject_name": doc_metadata.get("subject_name"),
                            "unit_number": doc_metadata.get("unit_number"),
                            "academic_year": doc_metadata.get("academic_year"),
                            "document_type": doc_metadata.get("document_type"),
                            "filename": doc_metadata.get("filename"),
                            "owner_id": doc_metadata.get("owner_id"),
                            "is_official": doc_metadata.get("is_official", 0),
                            "page_number": page_num,
                            "section_heading": active_section,
                            "chunk_index": chunk_counter,
                            "text": chunk_text
                        })
                        chunk_counter += 1

                    # Handle overlap
                    if len(words) > self.chunk_size:
                        # Slice large paragraph into chunk_size pieces
                        for i in range(0, len(words), self.chunk_size - self.chunk_overlap):
                            slice_words = words[i:i + self.chunk_size]
                            chunk_text = " ".join(slice_words)
                            chunk_id = f"{doc_metadata.get('document_id')}_chk_{chunk_counter}"
                            chunks.append({
                                "chunk_id": chunk_id,
                                "document_id": doc_metadata.get("document_id"),
                                "college_id": doc_metadata.get("college_id"),
                                "department": doc_metadata.get("department"),
                                "course_name": doc_metadata.get("course_name"),
                                "semester": doc_metadata.get("semester"),
                                "subject_id": doc_metadata.get("subject_id"),
                                "subject_name": doc_metadata.get("subject_name"),
                                "unit_number": doc_metadata.get("unit_number"),
                                "academic_year": doc_metadata.get("academic_year"),
                                "document_type": doc_metadata.get("document_type"),
                                "filename": doc_metadata.get("filename"),
                                "owner_id": doc_metadata.get("owner_id"),
                                "is_official": doc_metadata.get("is_official", 0),
                                "page_number": page_num,
                                "section_heading": active_section,
                                "chunk_index": chunk_counter,
                                "text": chunk_text
                            })
                            chunk_counter += 1
                        current_chunk_words = []
                        current_chunk_len = 0
                    else:
                        overlap_words = current_chunk_words[-self.chunk_overlap:] if len(current_chunk_words) > self.chunk_overlap else []
                        current_chunk_words = overlap_words + words
                        current_chunk_len = len(current_chunk_words)

            # Flush any remaining words
            if current_chunk_words:
                chunk_text = " ".join(current_chunk_words)
                chunk_id = f"{doc_metadata.get('document_id')}_chk_{chunk_counter}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": doc_metadata.get("document_id"),
                    "college_id": doc_metadata.get("college_id"),
                    "department": doc_metadata.get("department"),
                    "course_name": doc_metadata.get("course_name"),
                    "semester": doc_metadata.get("semester"),
                    "subject_id": doc_metadata.get("subject_id"),
                    "subject_name": doc_metadata.get("subject_name"),
                    "unit_number": doc_metadata.get("unit_number"),
                    "academic_year": doc_metadata.get("academic_year"),
                    "document_type": doc_metadata.get("document_type"),
                    "filename": doc_metadata.get("filename"),
                    "owner_id": doc_metadata.get("owner_id"),
                    "is_official": doc_metadata.get("is_official", 0),
                    "page_number": page_num,
                    "section_heading": active_section,
                    "chunk_index": chunk_counter,
                    "text": chunk_text
                })
                chunk_counter += 1

        return chunks

rag_processor = RAGProcessor()

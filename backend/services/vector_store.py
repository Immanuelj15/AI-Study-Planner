import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chroma_storage")

class VectorStoreService:
    """
    Production ChromaDB vector database service.
    Handles embedding generation, vector storage, metadata filtering,
    college data isolation, student access control, and document lifecycle management.
    """

    def __init__(self, persist_directory: str = CHROMA_PERSIST_DIR):
        self.persist_directory = persist_directory
        os.makedirs(self.persist_directory, exist_ok=True)
        self._client = None
        self._collection = None
        self.collection_name = "college_study_materials"
        self._init_chroma()

    def _init_chroma(self):
        """Initialize ChromaDB PersistentClient and collection."""
        try:
            import chromadb
            from chromadb.config import Settings

            self._client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(anonymized_telemetry=False, allow_reset=True)
            )

            # Initialize collection
            self._collection = self._client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "College Syllabus & Study Material RAG Vector Store"}
            )
            logger.info(f"ChromaDB initialized at '{self.persist_directory}' with collection '{self.collection_name}'")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise e

    def get_collection(self):
        if self._collection is None:
            self._init_chroma()
        return self._collection

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Store document chunks with metadata and embeddings in ChromaDB.
        Deduplicates chunks with stable chunk IDs.
        """
        if not chunks:
            return 0

        col = self.get_collection()

        ids = []
        documents = []
        metadatas = []

        for chunk in chunks:
            c_id = chunk["chunk_id"]
            text = chunk["text"]

            # Sanitize metadata values: ChromaDB requires int, float, str, or bool (no None)
            meta = {
                "document_id": str(chunk.get("document_id") or ""),
                "college_id": str(chunk.get("college_id") or "College_Main").strip(),
                "department": str(chunk.get("department") or ""),
                "course_name": str(chunk.get("course_name") or ""),
                "semester": int(chunk.get("semester") or 0),
                "subject_id": int(chunk.get("subject_id") or 0),
                "subject_name": str(chunk.get("subject_name") or "").strip().lower(),
                "unit_number": int(chunk.get("unit_number") or 0),
                "academic_year": str(chunk.get("academic_year") or ""),
                "document_type": str(chunk.get("document_type") or "Syllabus"),
                "filename": str(chunk.get("filename") or ""),
                "owner_id": int(chunk.get("owner_id") or 0),
                "is_official": int(chunk.get("is_official") or 0),
                "page_number": int(chunk.get("page_number") or 1),
                "section_heading": str(chunk.get("section_heading") or "")[:150],
                "chunk_index": int(chunk.get("chunk_index") or 0)
            }

            ids.append(c_id)
            documents.append(text)
            metadatas.append(meta)

        try:
            # Batch upsert to prevent duplicates
            col.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Successfully indexed {len(ids)} chunks into ChromaDB.")
            return len(ids)
        except Exception as e:
            logger.error(f"Error upserting chunks into ChromaDB: {e}")
            raise e

    def delete_document(self, document_id: str) -> int:
        """Delete all chunk vectors associated with a document_id."""
        col = self.get_collection()
        try:
            results = col.get(where={"document_id": str(document_id)})
            existing_ids = results.get("ids", [])
            if existing_ids:
                col.delete(ids=existing_ids)
                logger.info(f"Deleted {len(existing_ids)} chunks for document '{document_id}' from ChromaDB.")
                return len(existing_ids)
            return 0
        except Exception as e:
            logger.warning(f"ChromaDB delete error for document {document_id}: {e}")
            return 0

    def query_similar(
        self,
        query_text: str,
        college_id: str,
        user_id: int,
        subject_name: Optional[str] = None,
        unit_number: Optional[int] = None,
        semester: Optional[int] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Semantic similarity search with strict college isolation and user access permissions.
        User can retrieve:
          1. Official college materials belonging to their college_id (is_official == 1)
          2. Their own uploaded personal materials (owner_id == user_id)
        """
        col = self.get_collection()

        # Build ChromaDB metadata filter conditions
        conditions = [
            {"college_id": {"$eq": str(college_id).strip()}}
        ]

        if subject_name and subject_name.strip():
            conditions.append({"subject_name": {"$eq": subject_name.strip().lower()}})

        if unit_number and int(unit_number) > 0:
            conditions.append({"unit_number": {"$eq": int(unit_number)}})

        if semester and int(semester) > 0:
            conditions.append({"semester": {"$eq": int(semester)}})

        # Access control: (is_official == 1) OR (owner_id == user_id)
        access_condition = {
            "$or": [
                {"is_official": {"$eq": 1}},
                {"owner_id": {"$eq": int(user_id)}}
            ]
        }
        conditions.append(access_condition)

        # Construct final where clause
        where_clause = {"$and": conditions} if len(conditions) > 1 else conditions[0]

        try:
            # Query ChromaDB
            results = col.query(
                query_texts=[query_text],
                n_results=top_k * 2, # Fetch slightly more to filter relevance if needed
                where=where_clause
            )
        except Exception as e:
            logger.warning(f"ChromaDB query with strict filter failed ({e}). Retrying with relaxed college filter...")
            try:
                # Fallback to college + access filter
                fallback_where = {
                    "$and": [
                        {"college_id": {"$eq": str(college_id).strip()}},
                        access_condition
                    ]
                }
                results = col.query(
                    query_texts=[query_text],
                    n_results=top_k,
                    where=fallback_where
                )
            except Exception as e2:
                logger.error(f"Fallback ChromaDB query failed: {e2}")
                return []

        retrieved = []
        if results and "documents" in results and results["documents"]:
            docs_list = results["documents"][0]
            metas_list = results["metadatas"][0]
            distances = results.get("distances", [[]])[0] if "distances" in results and results["distances"] else []
            ids_list = results.get("ids", [[]])[0]

            for i in range(len(docs_list)):
                doc_text = docs_list[i]
                meta = metas_list[i]
                chunk_id = ids_list[i] if i < len(ids_list) else ""
                dist = distances[i] if i < len(distances) else 1.0

                # Convert L2 distance or cosine distance to a 0.0 - 1.0 similarity score
                similarity = round(max(0.0, 1.0 - (dist / 2.0)), 3)

                # Only include chunks that have meaningful semantic relevance
                if similarity >= 0.15:
                    retrieved.append({
                        "chunk_id": chunk_id,
                        "text": doc_text,
                        "document_id": meta.get("document_id"),
                        "filename": meta.get("filename"),
                        "college_id": meta.get("college_id"),
                        "subject_name": meta.get("subject_name"),
                        "unit_number": meta.get("unit_number"),
                        "page_number": meta.get("page_number"),
                        "section_heading": meta.get("section_heading"),
                        "chunk_index": meta.get("chunk_index"),
                        "is_official": meta.get("is_official"),
                        "relevance_score": similarity
                    })

        # Return top_k results
        return retrieved[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        """Return vector store health and total indexed chunks."""
        try:
            col = self.get_collection()
            count = col.count()
            return {
                "status": "online",
                "collection_name": self.collection_name,
                "total_chunks_indexed": count,
                "storage_path": self.persist_directory
            }
        except Exception as e:
            return {
                "status": f"error: {e}",
                "collection_name": self.collection_name,
                "total_chunks_indexed": 0,
                "storage_path": self.persist_directory
            }

vector_store = VectorStoreService()

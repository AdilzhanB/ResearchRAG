from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import tempfile
import shutil
from pathlib import Path
import aiosqlite
from datetime import datetime
import logging

from app.core.database import get_db
from app.models.schemas import DocumentResponse, DocumentUploadResponse, RAGQueryRequest, RAGQueryResponse
from app.services.rag_pipeline import rag_pipeline
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

async def save_document_to_db(db: aiosqlite.Connection, filename: str, filepath: str, file_type: str, file_size: int, user_id: int = 1):
    """Save document metadata to database"""
    try:
        await db.execute(
            """
            INSERT INTO legal_documents (title, content, document_type, file_path, user_id, upload_date, file_size)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (filename, "", file_type, filepath, user_id, datetime.utcnow().isoformat(), file_size)
        )
        await db.commit()
        
        cursor = await db.execute("SELECT last_insert_rowid()")
        doc_id = await cursor.fetchone()
        return doc_id[0] if doc_id else None
        
    except Exception as e:
        logger.error(f"Error saving document to database: {e}")
        raise

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size (this is approximate, actual size check happens during upload)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        return False
    
    return True

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Upload documents for legal research"""
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")
    
    uploaded_files = []
    temp_files = []
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIRECTORY)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        for file in files:
            # Validate file
            if not validate_file(file):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file: {file.filename}. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                )
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix)
            temp_files.append(temp_file.name)
            
            # Read and save file content
            content = await file.read()
            
            # Check actual file size
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                )
            
            temp_file.write(content)
            temp_file.close()
            
            # Save to permanent location
            file_path = upload_dir / f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            shutil.copy2(temp_file.name, file_path)
            
            # Save to database
            doc_id = await save_document_to_db(
                db, file.filename, str(file_path), 
                Path(file.filename).suffix.lower(), 
                len(content)
            )
            
            uploaded_files.append({
                "document_id": doc_id,
                "filename": file.filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "file_type": Path(file.filename).suffix.lower()
            })
        
        # Process documents in background
        background_tasks.add_task(process_documents_for_rag, [f["file_path"] for f in uploaded_files])
        
        return DocumentUploadResponse(
            message=f"Successfully uploaded {len(uploaded_files)} documents",
            documents=uploaded_files,
            total_uploaded=len(uploaded_files)
        )
        
    except Exception as e:
        logger.error(f"Error uploading documents: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass

async def process_documents_for_rag(file_paths: List[str]):
    """Background task to process documents and add to RAG pipeline"""
    try:
        logger.info(f"Processing {len(file_paths)} documents for RAG pipeline")
        
        # Load documents
        documents = rag_pipeline.add_documents_from_files(file_paths)
        
        if documents:
            # Initialize or update vectorstore
            if rag_pipeline.vectorstore is None:
                rag_pipeline.initialize_vectorstore(documents)
            else:
                # Add new documents to existing vectorstore
                chunks = rag_pipeline.text_splitter.split_documents(documents)
                rag_pipeline.vectorstore.add_documents(chunks)
            
            # Save updated vectorstore
            vectorstore_path = Path(settings.VECTORSTORE_PATH)
            vectorstore_path.mkdir(parents=True, exist_ok=True)
            rag_pipeline.save_vectorstore(str(vectorstore_path))
            
            logger.info(f"Successfully processed {len(documents)} documents for RAG")
        else:
            logger.warning("No documents were successfully loaded")
            
    except Exception as e:
        logger.error(f"Error processing documents for RAG: {e}")

@router.post("/query", response_model=RAGQueryResponse)
async def query_documents(request: RAGQueryRequest):
    """Query documents using RAG pipeline"""
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        # Use RAG pipeline to get answer
        if request.use_agent:
            response = rag_pipeline.agent_query(request.query)
        else:
            response = rag_pipeline.query(
                request.query, 
                use_conversation=request.use_conversation
            )
        
        # Get similarity search results
        similar_docs = rag_pipeline.similarity_search(request.query, k=5)
        
        return RAGQueryResponse(
            query=request.query,
            answer=response.get("answer", "No answer generated"),
            source_documents=similar_docs,
            chat_history=response.get("chat_history", []),
            tools_used=response.get("tools_used", []),
            error=response.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error querying documents: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@router.get("/search/{query}")
async def search_documents(query: str, limit: int = 5):
    """Search documents by similarity"""
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        results = rag_pipeline.similarity_search(query, k=limit)
        
        return {
            "query": query,
            "results": results,
            "total_results": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/stats")
async def get_rag_stats():
    """Get RAG pipeline statistics"""
    try:
        stats = rag_pipeline.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting RAG stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.post("/clear-memory")
async def clear_conversation_memory():
    """Clear conversation memory"""
    try:
        rag_pipeline.clear_memory()
        return {"message": "Conversation memory cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing memory: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear memory: {str(e)}")

@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(
    limit: int = 50,
    offset: int = 0,
    db: aiosqlite.Connection = Depends(get_db)
):
    """List uploaded documents"""
    try:
        cursor = await db.execute(
            """
            SELECT id, title, document_type, file_path, upload_date, file_size, user_id
            FROM legal_documents
            ORDER BY upload_date DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset)
        )
        
        documents = await cursor.fetchall()
        
        result = []
        for doc in documents:
            result.append(DocumentResponse(
                id=doc[0],
                title=doc[1],
                document_type=doc[2],
                file_path=doc[3],
                upload_date=doc[4],
                file_size=doc[5],
                user_id=doc[6]
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a document"""
    try:
        # Get document info
        cursor = await db.execute(
            "SELECT file_path FROM legal_documents WHERE id = ?",
            (document_id,)
        )
        doc = await cursor.fetchone()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file from filesystem
        try:
            if os.path.exists(doc[0]):
                os.unlink(doc[0])
        except Exception as e:
            logger.warning(f"Could not delete file {doc[0]}: {e}")
        
        # Delete from database
        await db.execute("DELETE FROM legal_documents WHERE id = ?", (document_id,))
        await db.commit()
        
        return {"message": f"Document {document_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

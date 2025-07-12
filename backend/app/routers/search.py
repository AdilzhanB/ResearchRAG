from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
import logging
from app.models.schemas import (
    SearchRequest, 
    SearchResponse, 
    LegalDocument,
    StandardResponse
)
from app.models.database import LegalDocument as DBLegalDocument, SearchHistory, User
from app.services.vector_service import vector_service
from app.services.gemini_service import gemini_service
from app.core.database import get_db
import json

logger = logging.getLogger(__name__)
router = APIRouter()

# Remove mock data - now using real database

@router.post("/documents", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Search legal documents using advanced RAG and AI-powered query enhancement
    """
    try:
        logger.info(f"Searching documents with query: {request.query}")
        
        # Enhance search query using AI
        enhanced_query = await gemini_service.generate_search_query(
            request.query, 
            context="legal document search"
        )
        
        logger.info(f"Enhanced query: {enhanced_query}")
        
        # Search using vector similarity
        vector_results = await vector_service.search_similar(
            enhanced_query, 
            k=min(request.limit * 2, 100),  # Get more results for filtering
            threshold=0.3
        )
        
        # Get document IDs from vector search
        document_ids = [result['document_id'] for result in vector_results]
        
        # Build database query
        query = select(DBLegalDocument)
        filters = []
        
        # Apply document ID filter from vector search
        if document_ids:
            filters.append(DBLegalDocument.id.in_(document_ids))
        else:
            # Fallback to text search if no vector results
            search_filter = or_(
                DBLegalDocument.title.ilike(f"%{request.query}%"),
                DBLegalDocument.content.ilike(f"%{request.query}%")
            )
            filters.append(search_filter)
        
        # Apply document type filter
        if request.document_types:
            doc_type_strs = [dt.value for dt in request.document_types]
            filters.append(DBLegalDocument.document_type.in_(doc_type_strs))
        
        # Apply jurisdiction filter
        if request.jurisdictions:
            filters.append(DBLegalDocument.jurisdiction.in_(request.jurisdictions))
        
        # Combine filters
        if filters:
            query = query.where(and_(*filters))
        
        # Execute query
        result = await db.execute(query)
        db_documents = result.scalars().all()
        
        # Combine database results with similarity scores
        documents_with_scores = []
        vector_scores = {r['document_id']: r['similarity_score'] for r in vector_results}
        
        for db_doc in db_documents:
            # Convert to response model
            doc_dict = {
                'id': db_doc.id,
                'title': db_doc.title,
                'content': db_doc.content,
                'type': db_doc.document_type,
                'jurisdiction': db_doc.jurisdiction,
                'date': db_doc.date_published,
                'citations': db_doc.citations or [],
                'similarity_score': vector_scores.get(db_doc.id, 0.0),
                'metadata': db_doc.metadata or {}
            }
            documents_with_scores.append(doc_dict)
        
        # Sort by similarity score (descending)
        documents_with_scores.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Apply pagination
        start_idx = request.offset
        end_idx = start_idx + request.limit
        paginated_docs = documents_with_scores[start_idx:end_idx]
        
        # Convert to LegalDocument objects
        legal_documents = [LegalDocument(**doc) for doc in paginated_docs]
        
        # Save search history (background task)
        background_tasks.add_task(
            save_search_history,
            db_session=db,
            query=request.query,
            enhanced_query=enhanced_query,
            filters={
                "jurisdictions": request.jurisdictions,
                "document_types": [dt.value for dt in request.document_types] if request.document_types else []
            },
            results_count=len(documents_with_scores)
        )
        
        response = SearchResponse(
            documents=legal_documents,
            query=request.query,
            total_results=len(documents_with_scores),
            search_time=0.234,  # Would measure actual time in production
            filters_applied={
                "jurisdictions": request.jurisdictions,
                "document_types": [dt.value for dt in request.document_types] if request.document_types else [],
                "enhanced_query": enhanced_query
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/documents/{document_id}", response_model=LegalDocument)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific legal document by ID
    """
    try:
        # Query database for document
        query = select(DBLegalDocument).where(DBLegalDocument.id == document_id)
        result = await db.execute(query)
        db_document = result.scalar_one_or_none()
        
        if not db_document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Convert to response model
        legal_doc = LegalDocument(
            id=db_document.id,
            title=db_document.title,
            content=db_document.content,
            type=db_document.document_type,
            jurisdiction=db_document.jurisdiction,
            date=db_document.date_published,
            citations=db_document.citations or [],
            metadata=db_document.metadata or {}
        )
        
        return legal_doc
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve document: {str(e)}")

@router.get("/documents/{document_id}/similar", response_model=List[LegalDocument])
async def get_similar_documents(
    document_id: str, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """
    Find documents similar to the specified document
    """
    try:
        # Check if document exists
        query = select(DBLegalDocument).where(DBLegalDocument.id == document_id)
        result = await db.execute(query)
        base_document = result.scalar_one_or_none()
        
        if not base_document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Find similar documents using vector search
        similar_results = await vector_service.get_similar_documents(document_id, limit)
        
        if not similar_results:
            return []
        
        # Get document IDs
        similar_doc_ids = [result['document_id'] for result in similar_results]
        
        # Query database for similar documents
        query = select(DBLegalDocument).where(DBLegalDocument.id.in_(similar_doc_ids))
        result = await db.execute(query)
        db_documents = result.scalars().all()
        
        # Combine with similarity scores
        doc_scores = {r['document_id']: r['similarity_score'] for r in similar_results}
        
        similar_docs = []
        for db_doc in db_documents:
            legal_doc = LegalDocument(
                id=db_doc.id,
                title=db_doc.title,
                content=db_doc.content,
                type=db_doc.document_type,
                jurisdiction=db_doc.jurisdiction,
                date=db_doc.date_published,
                citations=db_doc.citations or [],
                similarity_score=doc_scores.get(db_doc.id, 0.0),
                metadata=db_doc.metadata or {}
            )
            similar_docs.append(legal_doc)
        
        # Sort by similarity score
        similar_docs.sort(key=lambda x: x.similarity_score or 0.0, reverse=True)
        
        return similar_docs[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding similar documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find similar documents: {str(e)}")

@router.post("/reindex", response_model=StandardResponse)
async def reindex_documents(
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger reindexing of all documents in the vector database
    """
    try:
        # Add reindexing task to background
        background_tasks.add_task(perform_reindexing, db)
        
        return StandardResponse(
            message="Document reindexing started in background"
        )
        
    except Exception as e:
        logger.error(f"Error starting reindexing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start reindexing: {str(e)}")

async def perform_reindexing(db: AsyncSession):
    """Background task to reindex documents"""
    try:
        logger.info("Starting document reindexing...")
        
        # Get all documents from database
        query = select(DBLegalDocument)
        result = await db.execute(query)
        documents = result.scalars().all()
        
        # Convert to format needed for vector service
        doc_data = []
        for doc in documents:
            doc_data.append({
                'id': doc.id,
                'content': doc.content,
                'title': doc.title,
                'type': doc.document_type,
                'jurisdiction': doc.jurisdiction,
                'date': doc.date_published,
                'citations': doc.citations or []
            })
        
        # Reindex in vector database
        await vector_service.reindex_all(doc_data)
        
        logger.info(f"Document reindexing completed - processed {len(documents)} documents")
        
    except Exception as e:
        logger.error(f"Error during reindexing: {e}")

async def save_search_history(
    db_session: AsyncSession,
    query: str,
    enhanced_query: str,
    filters: dict,
    results_count: int,
    user_id: Optional[int] = None
):
    """Save search history to database"""
    try:
        # Create search history record
        search_record = SearchHistory(
            user_id=user_id,  # Would get from auth in production
            query=query,
            enhanced_query=enhanced_query,
            filters=filters,
            results_count=results_count,
            search_time=0.234  # Would measure actual time
        )
        
        db_session.add(search_record)
        await db_session.commit()
        
    except Exception as e:
        logger.error(f"Error saving search history: {e}")

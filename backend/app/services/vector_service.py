import faiss
import numpy as np
import os
import json
import pickle
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.index = None
        self.embedding_model = None
        self.document_metadata = {}
        self.vector_db_path = settings.VECTOR_DB_PATH
        self.embedding_model_name = settings.EMBEDDING_MODEL
        self.dimension = settings.VECTOR_DIMENSION
        
    async def initialize(self):
        """Initialize the vector service"""
        try:
            # Create vector DB directory if it doesn't exist
            os.makedirs(self.vector_db_path, exist_ok=True)
            
            # Load embedding model
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            
            # Load or create FAISS index
            await self._load_or_create_index()
            
            logger.info("Vector service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing vector service: {e}")
            raise
    
    async def _load_or_create_index(self):
        """Load existing FAISS index or create new one"""
        index_path = os.path.join(self.vector_db_path, "faiss_index.bin")
        metadata_path = os.path.join(self.vector_db_path, "metadata.json")
        
        if os.path.exists(index_path) and os.path.exists(metadata_path):
            # Load existing index
            self.index = faiss.read_index(index_path)
            with open(metadata_path, 'r') as f:
                self.document_metadata = json.load(f)
            logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors")
        else:
            # Create new index
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner Product for cosine similarity
            self.document_metadata = {}
            logger.info("Created new FAISS index")
    
    async def add_document(self, document_id: str, content: str, metadata: Dict[str, Any] = None):
        """Add a document to the vector database"""
        try:
            # Generate embedding
            embedding = self.embedding_model.encode([content])
            embedding = embedding / np.linalg.norm(embedding, axis=1, keepdims=True)  # Normalize for cosine similarity
            
            # Add to FAISS index
            self.index.add(embedding.astype('float32'))
            
            # Store metadata
            vector_id = self.index.ntotal - 1  # Last added vector index
            self.document_metadata[str(vector_id)] = {
                'document_id': document_id,
                'metadata': metadata or {}
            }
            
            # Save index and metadata
            await self._save_index()
            
            logger.info(f"Added document {document_id} to vector database")
            return vector_id
            
        except Exception as e:
            logger.error(f"Error adding document to vector database: {e}")
            raise
    
    async def search_similar(self, query: str, k: int = 10, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            if self.index.ntotal == 0:
                return []
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])
            query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
            
            # Search in FAISS index
            scores, indices = self.index.search(query_embedding.astype('float32'), k)
            
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if score >= threshold and str(idx) in self.document_metadata:
                    result = self.document_metadata[str(idx)].copy()
                    result['similarity_score'] = float(score)
                    result['vector_id'] = int(idx)
                    results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching vector database: {e}")
            raise
    
    async def get_similar_documents(self, document_id: str, k: int = 10) -> List[Dict[str, Any]]:
        """Find documents similar to a specific document"""
        try:
            # Find the vector ID for the document
            vector_id = None
            for vid, metadata in self.document_metadata.items():
                if metadata['document_id'] == document_id:
                    vector_id = int(vid)
                    break
            
            if vector_id is None:
                return []
            
            # Get the document's vector
            document_vector = self.index.reconstruct(vector_id).reshape(1, -1)
            
            # Search for similar vectors
            scores, indices = self.index.search(document_vector, k + 1)  # +1 to exclude self
            
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx != vector_id and str(idx) in self.document_metadata:  # Exclude the document itself
                    result = self.document_metadata[str(idx)].copy()
                    result['similarity_score'] = float(score)
                    result['vector_id'] = int(idx)
                    results.append(result)
            
            return results[:k]  # Return only k results
            
        except Exception as e:
            logger.error(f"Error finding similar documents: {e}")
            raise
    
    async def update_document(self, document_id: str, content: str, metadata: Dict[str, Any] = None):
        """Update a document in the vector database"""
        try:
            # Find and remove old vector
            vector_id = None
            for vid, meta in self.document_metadata.items():
                if meta['document_id'] == document_id:
                    vector_id = int(vid)
                    break
            
            if vector_id is not None:
                # Remove from metadata
                del self.document_metadata[str(vector_id)]
            
            # Add updated document (FAISS doesn't support in-place updates easily)
            await self.add_document(document_id, content, metadata)
            
            logger.info(f"Updated document {document_id} in vector database")
            
        except Exception as e:
            logger.error(f"Error updating document in vector database: {e}")
            raise
    
    async def remove_document(self, document_id: str):
        """Remove a document from the vector database"""
        try:
            # Find the vector ID
            vector_id = None
            for vid, metadata in self.document_metadata.items():
                if metadata['document_id'] == document_id:
                    vector_id = vid
                    break
            
            if vector_id is not None:
                # Remove from metadata
                del self.document_metadata[vector_id]
                # Note: FAISS doesn't support easy removal, so we keep the vector but remove metadata
                # In production, you might want to rebuild the index periodically
                
                await self._save_index()
                logger.info(f"Removed document {document_id} from vector database")
            
        except Exception as e:
            logger.error(f"Error removing document from vector database: {e}")
            raise
    
    async def _save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            index_path = os.path.join(self.vector_db_path, "faiss_index.bin")
            metadata_path = os.path.join(self.vector_db_path, "metadata.json")
            
            # Save FAISS index
            faiss.write_index(self.index, index_path)
            
            # Save metadata
            with open(metadata_path, 'w') as f:
                json.dump(self.document_metadata, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving vector database: {e}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get vector database statistics"""
        return {
            'total_vectors': self.index.ntotal if self.index else 0,
            'dimension': self.dimension,
            'embedding_model': self.embedding_model_name,
            'total_documents': len(self.document_metadata)
        }
    
    async def reindex_all(self, documents: List[Dict[str, Any]]):
        """Reindex all documents"""
        try:
            # Create new index
            self.index = faiss.IndexFlatIP(self.dimension)
            self.document_metadata = {}
            
            # Add all documents
            for doc in documents:
                await self.add_document(
                    doc['id'], 
                    doc['content'], 
                    {
                        'title': doc.get('title', ''),
                        'type': doc.get('type', ''),
                        'jurisdiction': doc.get('jurisdiction', ''),
                        'date': doc.get('date', ''),
                        'citations': doc.get('citations', [])
                    }
                )
            
            logger.info(f"Reindexed {len(documents)} documents")
            
        except Exception as e:
            logger.error(f"Error reindexing documents: {e}")
            raise
    
    async def close(self):
        """Clean up resources"""
        try:
            if self.index:
                await self._save_index()
            logger.info("Vector service closed successfully")
        except Exception as e:
            logger.error(f"Error closing vector service: {e}")

# Global vector service instance
vector_service = VectorService()

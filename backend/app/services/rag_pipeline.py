from langchain.chains import RetrievalQA, ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader, UnstructuredWordDocumentLoader
from langchain.schema import Document
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.tools import Tool, WikipediaQueryRun
from langchain.utilities import WikipediaAPIWrapper
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

class GeminiLLM(LLM):
    """Custom LangChain LLM wrapper for Google Gemini"""
    
    def __init__(self, model_name: str = "gemini-pro", api_key: str = None):
        super().__init__()
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    @property
    def _llm_type(self) -> str:
        return "gemini"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            return f"Error: {str(e)}"

class LegalRAGPipeline:
    """Advanced Legal RAG Pipeline with LangChain"""
    
    def __init__(self, google_api_key: str = None):
        from app.core.config import settings
        api_key = google_api_key or settings.GOOGLE_API_KEY
        
        if api_key:
            self.llm = GeminiLLM(api_key=api_key)
        else:
            logger.warning("No Google API key provided, RAG pipeline will have limited functionality")
            self.llm = None
            
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        self.vectorstore = None
        self.qa_chain = None
        self.conversational_chain = None
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.agent = None
        self._setup_tools()
        
    def _setup_tools(self):
        """Setup LangChain tools for the agent"""
        # Wikipedia tool for legal research
        wikipedia = WikipediaAPIWrapper()
        wikipedia_tool = WikipediaQueryRun(api_wrapper=wikipedia)
        
        # Legal case search tool
        def search_legal_cases(query: str) -> str:
            """Search for legal cases and precedents"""
            try:
                # This would integrate with legal databases like Westlaw, LexisNexis
                # For demo, we'll use a mock implementation
                return f"Found relevant legal cases for: {query}\n- Case 1: Sample Case Name\n- Case 2: Another Case Name"
            except Exception as e:
                return f"Error searching legal cases: {e}"
        
        legal_search_tool = Tool(
            name="Legal Case Search",
            description="Search for legal cases, precedents, and court decisions",
            func=search_legal_cases
        )
        
        # Statute search tool
        def search_statutes(query: str) -> str:
            """Search for statutes and regulations"""
            try:
                return f"Found relevant statutes for: {query}\n- Statute 1: Sample Statute\n- Regulation 1: Sample Regulation"
            except Exception as e:
                return f"Error searching statutes: {e}"
        
        statute_search_tool = Tool(
            name="Statute Search",
            description="Search for statutes, regulations, and legal codes",
            func=search_statutes
        )
        
        # Citation formatter tool
        def format_legal_citation(text: str) -> str:
            """Format legal citations properly"""
            try:
                # This would use proper citation formatting logic
                return f"Formatted citation: {text}"
            except Exception as e:
                return f"Error formatting citation: {e}"
        
        citation_tool = Tool(
            name="Citation Formatter",
            description="Format legal citations according to standard formats",
            func=format_legal_citation
        )
        
        self.tools = [
            wikipedia_tool,
            legal_search_tool,
            statute_search_tool,
            citation_tool
        ]
        
    def initialize_vectorstore(self, documents: List[Document]):
        """Initialize vector store with documents"""
        try:
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            # Create vector store
            self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
            
            # Setup QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(
                    search_type="similarity",
                    search_kwargs={"k": 5}
                )
            )
            
            # Setup conversational chain
            self.conversational_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
                memory=self.memory
            )
            
            # Setup agent with tools
            self.agent = initialize_agent(
                self.tools,
                self.llm,
                agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
                memory=self.memory,
                verbose=True
            )
            
            logger.info(f"Initialized RAG pipeline with {len(chunks)} document chunks")
            
        except Exception as e:
            logger.error(f"Error initializing vectorstore: {e}")
            raise
    
    def add_documents_from_files(self, file_paths: List[str]) -> List[Document]:
        """Load documents from various file formats"""
        documents = []
        
        for file_path in file_paths:
            try:
                file_path = Path(file_path)
                
                if file_path.suffix.lower() == '.pdf':
                    loader = PyPDFLoader(str(file_path))
                elif file_path.suffix.lower() == '.txt':
                    loader = TextLoader(str(file_path))
                elif file_path.suffix.lower() in ['.doc', '.docx']:
                    loader = UnstructuredWordDocumentLoader(str(file_path))
                else:
                    logger.warning(f"Unsupported file format: {file_path.suffix}")
                    continue
                
                docs = loader.load()
                documents.extend(docs)
                logger.info(f"Loaded {len(docs)} documents from {file_path.name}")
                
            except Exception as e:
                logger.error(f"Error loading file {file_path}: {e}")
                
        return documents
    
    def add_text_documents(self, texts: List[str], metadatas: List[Dict] = None) -> List[Document]:
        """Add text documents to the pipeline"""
        documents = []
        
        for i, text in enumerate(texts):
            metadata = metadatas[i] if metadatas and i < len(metadatas) else {}
            doc = Document(page_content=text, metadata=metadata)
            documents.append(doc)
            
        return documents
    
    def query(self, question: str, use_conversation: bool = False) -> Dict[str, Any]:
        """Query the RAG pipeline"""
        try:
            if not self.vectorstore:
                return {
                    "answer": "No documents have been indexed yet. Please upload documents first.",
                    "source_documents": [],
                    "error": "No vectorstore initialized"
                }
            
            if use_conversation and self.conversational_chain:
                # Use conversational chain for context-aware responses
                response = self.conversational_chain({"question": question})
                return {
                    "answer": response["answer"],
                    "source_documents": response.get("source_documents", []),
                    "chat_history": response.get("chat_history", [])
                }
            else:
                # Use simple QA chain
                response = self.qa_chain({"query": question})
                return {
                    "answer": response["result"],
                    "source_documents": response.get("source_documents", [])
                }
                
        except Exception as e:
            logger.error(f"Error querying RAG pipeline: {e}")
            return {
                "answer": f"Error processing query: {str(e)}",
                "source_documents": [],
                "error": str(e)
            }
    
    def agent_query(self, question: str) -> Dict[str, Any]:
        """Query using the agent with tools"""
        try:
            if not self.agent:
                return {
                    "answer": "Agent not initialized. Please initialize with documents first.",
                    "error": "No agent available"
                }
            
            response = self.agent.run(question)
            return {
                "answer": response,
                "agent_type": "conversational_react",
                "tools_used": [tool.name for tool in self.tools]
            }
            
        except Exception as e:
            logger.error(f"Error with agent query: {e}")
            return {
                "answer": f"Error with agent query: {str(e)}",
                "error": str(e)
            }
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Perform similarity search on documents"""
        try:
            if not self.vectorstore:
                return []
            
            docs = self.vectorstore.similarity_search_with_score(query, k=k)
            
            results = []
            for doc, score in docs:
                results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": float(score)
                })
                
            return results
            
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []
    
    def get_relevant_documents(self, query: str, k: int = 5) -> List[Document]:
        """Get relevant documents for a query"""
        try:
            if not self.vectorstore:
                return []
            
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
            docs = retriever.get_relevant_documents(query)
            return docs
            
        except Exception as e:
            logger.error(f"Error getting relevant documents: {e}")
            return []
    
    def save_vectorstore(self, path: str):
        """Save the vector store to disk"""
        try:
            if self.vectorstore:
                self.vectorstore.save_local(path)
                logger.info(f"Vector store saved to {path}")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}")
            raise
    
    def load_vectorstore(self, path: str):
        """Load vector store from disk"""
        try:
            if os.path.exists(path):
                self.vectorstore = FAISS.load_local(path, self.embeddings)
                
                # Reinitialize chains
                self.qa_chain = RetrievalQA.from_chain_type(
                    llm=self.llm,
                    chain_type="stuff",
                    retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5})
                )
                
                self.conversational_chain = ConversationalRetrievalChain.from_llm(
                    llm=self.llm,
                    retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
                    memory=self.memory
                )
                
                self.agent = initialize_agent(
                    self.tools,
                    self.llm,
                    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
                    memory=self.memory,
                    verbose=True
                )
                
                logger.info(f"Vector store loaded from {path}")
            else:
                logger.warning(f"Vector store path does not exist: {path}")
                
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            raise
    
    def clear_memory(self):
        """Clear conversation memory"""
        self.memory.clear()
        logger.info("Conversation memory cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get pipeline statistics"""
        stats = {
            "vectorstore_initialized": self.vectorstore is not None,
            "qa_chain_initialized": self.qa_chain is not None,
            "conversational_chain_initialized": self.conversational_chain is not None,
            "agent_initialized": self.agent is not None,
            "tools_available": len(self.tools),
            "tool_names": [tool.name for tool in self.tools]
        }
        
        if self.vectorstore:
            stats["total_documents"] = self.vectorstore.index.ntotal
            
        return stats

# Global RAG pipeline instance
rag_pipeline = LegalRAGPipeline()

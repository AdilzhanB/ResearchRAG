from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    searches = relationship("SearchHistory", back_populates="user")
    bookmarks = relationship("DocumentBookmark", back_populates="user")
    deadlines = relationship("Deadline", back_populates="user")

class LegalDocument(Base):
    __tablename__ = "legal_documents"
    
    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=False)
    document_type = Column(String(50), nullable=False, index=True)
    jurisdiction = Column(String(100), nullable=False, index=True)
    date_published = Column(String(20), nullable=False)
    citations = Column(JSON, default=list)
    document_metadata = Column(JSON, default=dict)
    file_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Vector embedding info
    vector_id = Column(String(100), unique=True, index=True)
    embedding_model = Column(String(100))
    
    # Relationships
    bookmarks = relationship("DocumentBookmark", back_populates="document")
    analyses = relationship("CaseAnalysis", back_populates="document")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query = Column(String(1000), nullable=False)
    enhanced_query = Column(String(1000))
    filters = Column(JSON, default=dict)
    results_count = Column(Integer)
    search_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="searches")

class DocumentBookmark(Base):
    __tablename__ = "document_bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(String(50), ForeignKey("legal_documents.id"), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="bookmarks")
    document = relationship("LegalDocument", back_populates="bookmarks")

class CaseAnalysis(Base):
    __tablename__ = "case_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), ForeignKey("legal_documents.id"), nullable=False)
    analysis_type = Column(String(50), nullable=False)
    key_holdings = Column(JSON, default=list)
    legal_issues = Column(JSON, default=list)
    precedents = Column(JSON, default=list)
    conflicts = Column(JSON, default=list)
    similarity_scores = Column(JSON, default=dict)
    analysis_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("LegalDocument", back_populates="analyses")

class Deadline(Base):
    __tablename__ = "deadlines"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_name = Column(String(200), nullable=False)
    deadline_type = Column(String(100), nullable=False)
    deadline_date = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="pending")  # pending, completed, overdue
    priority = Column(String(10), default="medium")  # low, medium, high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="deadlines")

class CitationValidation(Base):
    __tablename__ = "citation_validations"
    
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    citation_style = Column(String(20), nullable=False)
    formatted_citation = Column(Text)
    validation_errors = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DocumentTemplate(Base):
    __tablename__ = "document_templates"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    template_type = Column(String(50), nullable=False)
    description = Column(Text)
    content_template = Column(Text, nullable=False)
    fields = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

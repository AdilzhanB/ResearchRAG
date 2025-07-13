from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    CASE_LAW = "case_law"
    STATUTE = "statute"
    REGULATION = "regulation"
    BRIEF = "brief"
    CONTRACT = "contract"

class JurisdictionType(str, Enum):
    FEDERAL = "federal"
    STATE = "state"
    LOCAL = "local"

class CitationStyle(str, Enum):
    BLUEBOOK = "bluebook"
    APA = "apa"
    MLA = "mla"

class AnalysisType(str, Enum):
    PRECEDENT = "precedent"
    CONFLICT = "conflict"
    SIMILARITY = "similarity"
    FULL = "full"

# Base Models
class LegalDocument(BaseModel):
    id: str
    title: str
    content: str
    type: DocumentType
    jurisdiction: str
    date: str
    citations: List[str] = []
    similarity_score: Optional[float] = None
    document_metadata: Dict[str, Any] = {}

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    jurisdictions: Optional[List[str]] = []
    document_types: Optional[List[DocumentType]] = []
    date_range: Optional[Dict[str, str]] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

class SearchResponse(BaseModel):
    documents: List[LegalDocument]
    query: str
    total_results: int
    search_time: float
    filters_applied: Dict[str, Any] = {}

class CaseAnalysisRequest(BaseModel):
    document_id: str
    analysis_type: AnalysisType = AnalysisType.FULL
    include_holdings: bool = True
    include_issues: bool = True

class CaseAnalysis(BaseModel):
    case_id: str
    precedents: List[LegalDocument] = []
    conflicts: List[LegalDocument] = []
    key_holdings: List[str] = []
    legal_issues: List[str] = []
    similarity_scores: Dict[str, float] = {}
    analysis_summary: str = ""

class ConflictCheckRequest(BaseModel):
    document_ids: List[str] = Field(..., min_items=2)

class ConflictResult(BaseModel):
    doc1: str
    doc2: str
    conflict_type: str
    description: str
    severity: str = Field(..., pattern="^(low|medium|high)$")

class ConflictCheckResponse(BaseModel):
    conflicts: List[ConflictResult]

class CitationFormatRequest(BaseModel):
    text: str = Field(..., min_length=1)
    citation_style: CitationStyle = CitationStyle.BLUEBOOK
    jurisdiction: Optional[str] = None

class CitationFormatResponse(BaseModel):
    formatted_citation: str
    citation_errors: List[str] = []

class CitationValidationRequest(BaseModel):
    text: str = Field(..., min_length=1)

class CitationValidationResult(BaseModel):
    citation: str
    valid: bool
    errors: List[str] = []
    suggestions: List[str] = []

class CitationValidationResponse(BaseModel):
    citations: List[CitationValidationResult]

class DocumentDraftRequest(BaseModel):
    template_type: str = Field(..., pattern="^(brief|motion|contract|memo)$")
    case_info: Optional[Dict[str, str]] = None
    key_arguments: List[str] = []
    supporting_cases: List[str] = []
    custom_instructions: Optional[str] = None

class DocumentDraftResponse(BaseModel):
    document: str
    suggestions: List[str] = []
    template_used: str
    word_count: int

class DraftingTemplate(BaseModel):
    id: str
    name: str
    type: str
    description: str
    fields: List[Dict[str, Any]]

class DeadlineRequest(BaseModel):
    case_name: str = Field(..., min_length=1)
    deadline_type: str
    date: str
    description: str
    priority: str = Field(..., pattern="^(low|medium|high)$")

class Deadline(BaseModel):
    id: str
    case_name: str
    deadline_type: str
    date: str
    description: str
    status: str = Field(..., pattern="^(pending|completed|overdue)$")
    priority: str = Field(..., pattern="^(low|medium|high)$")
    created_at: datetime
    updated_at: Optional[datetime] = None

class Jurisdiction(BaseModel):
    code: str
    name: str
    type: JurisdictionType
    courts: List[str] = []

class DocumentTypeInfo(BaseModel):
    code: str
    name: str
    description: str

# Document Upload and RAG Models
class DocumentResponse(BaseModel):
    id: int
    title: str
    document_type: str
    file_path: str
    upload_date: str
    file_size: int
    user_id: int

class DocumentUploadResponse(BaseModel):
    message: str
    documents: List[Dict[str, Any]]
    total_uploaded: int

class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    use_conversation: bool = False
    use_agent: bool = False

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    source_documents: List[Dict[str, Any]] = []
    chat_history: List[Dict[str, Any]] = []
    tools_used: List[str] = []
    error: Optional[str] = None

class AgentToolRequest(BaseModel):
    tool_name: str
    query: str
    parameters: Optional[Dict[str, Any]] = {}

class AgentToolResponse(BaseModel):
    tool_name: str
    result: str
    success: bool
    error: Optional[str] = None

# Response Models
class StandardResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[str] = None

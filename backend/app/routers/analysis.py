from fastapi import APIRouter, HTTPException
import logging
from app.models.schemas import (
    CaseAnalysisRequest,
    CaseAnalysis, 
    ConflictCheckRequest,
    ConflictCheckResponse,
    StandardResponse
)
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/case", response_model=CaseAnalysis)
async def analyze_case(request: CaseAnalysisRequest):
    """
    Perform comprehensive legal case analysis
    """
    try:
        logger.info(f"Analyzing case: {request.document_id}")
        
        gemini_service = GeminiService()
        
        # Mock document content (would be retrieved from database)
        document_content = "Sample legal document content for analysis..."
        
        # Perform AI analysis
        analysis_result = await gemini_service.analyze_legal_document(
            document_content, 
            request.analysis_type.value
        )
        
        response = CaseAnalysis(
            case_id=request.document_id,
            key_holdings=analysis_result.get("key_holdings", []),
            legal_issues=analysis_result.get("legal_issues", []),
            precedents=[],  # Would be populated with actual precedent search
            conflicts=[],   # Would be populated with conflict analysis
            similarity_scores={},
            analysis_summary=analysis_result.get("summary", "")
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing case: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/conflicts", response_model=ConflictCheckResponse) 
async def check_conflicts(request: ConflictCheckRequest):
    """
    Check for conflicts between multiple legal documents
    """
    try:
        logger.info(f"Checking conflicts for documents: {request.document_ids}")
        
        gemini_service = GeminiService()
        
        # Mock document data
        cases = [{"id": doc_id, "title": f"Case {doc_id}", "content": "Sample content"} 
                for doc_id in request.document_ids]
        
        conflicts = await gemini_service.check_case_conflicts(cases)
        
        return ConflictCheckResponse(conflicts=conflicts)
        
    except Exception as e:
        logger.error(f"Error checking conflicts: {e}")
        raise HTTPException(status_code=500, detail=f"Conflict check failed: {str(e)}")

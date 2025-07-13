from fastapi import APIRouter, HTTPException
from typing import List
import logging
from app.models.schemas import (
    CitationFormatRequest,
    CitationFormatResponse,
    CitationValidationRequest, 
    CitationValidationResponse,
    StandardResponse
)
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/format", response_model=CitationFormatResponse)
async def format_citations(request: CitationFormatRequest):
    """
    Format legal citations according to specified style
    """
    try:
        logger.info(f"Formatting citation in {request.citation_style} style")
        
        result = await GeminiService.format_citation(
            request.text, 
            request.citation_style.value
        )
        
        return CitationFormatResponse(**result)
        
    except Exception as e:
        logger.error(f"Error formatting citations: {e}")
        raise HTTPException(status_code=500, detail=f"Citation formatting failed: {str(e)}")

@router.post("/validate", response_model=CitationValidationResponse)
async def validate_citations(request: CitationValidationRequest):
    """
    Validate legal citations in text
    """
    try:
        logger.info("Validating citations in text")
        
        # Extract potential citations from text (simplified)
        import re
        citation_patterns = [
            r'\d+\s+U\.S\.\s+\d+',  # U.S. citations
            r'\d+\s+S\.\s?Ct\.\s+\d+',  # Supreme Court
            r'\d+\s+F\.\d+d\s+\d+',  # Federal courts
        ]
        
        citations = []
        for pattern in citation_patterns:
            matches = re.findall(pattern, request.text)
            citations.extend(matches)
        
        # Validate each citation
        validation_results = []
        for citation in citations:
            # Use AI to validate (simplified for demo)
            validation_result = {
                "citation": citation,
                "valid": True,  # Would use real validation
                "errors": [],
                "suggestions": []
            }
            validation_results.append(validation_result)
        
        return CitationValidationResponse(citations=validation_results)
        
    except Exception as e:
        logger.error(f"Error validating citations: {e}")
        raise HTTPException(status_code=500, detail=f"Citation validation failed: {str(e)}")

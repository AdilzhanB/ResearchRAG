from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging
from app.models.schemas import (
    DocumentDraftRequest,
    DocumentDraftResponse,
    DraftingTemplate,
    StandardResponse
)
from app.models.database import DocumentTemplate as DBDocumentTemplate
from app.services.gemini_service import gemini_service
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=DocumentDraftResponse)
async def generate_document(request: DocumentDraftRequest):
    """
    Generate legal document using AI
    """
    try:
        logger.info(f"Generating {request.template_type} document")
        
        # Prepare parameters for AI generation
        parameters = {
            "template_type": request.template_type,
            "case_info": request.case_info or {},
            "key_arguments": request.key_arguments,
            "supporting_cases": request.supporting_cases,
            "custom_instructions": request.custom_instructions
        }
        
        result = await gemini_service.generate_document(
            request.template_type, 
            parameters
        )
        
        # Calculate word count
        word_count = len(result["document"].split()) if result.get("document") else 0
        result["word_count"] = word_count
        
        return DocumentDraftResponse(**result)
        
    except Exception as e:
        logger.error(f"Error generating document: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

@router.get("/templates", response_model=List[DraftingTemplate])
async def get_drafting_templates(db: AsyncSession = Depends(get_db)):
    """
    Get available document templates
    """
    try:
        # Query database for templates
        query = select(DBDocumentTemplate).where(DBDocumentTemplate.is_active == True)
        result = await db.execute(query)
        db_templates = result.scalars().all()
        
        # Convert to response model
        templates = []
        for db_template in db_templates:
            template = DraftingTemplate(
                id=db_template.id,
                name=db_template.name,
                type=db_template.template_type,
                description=db_template.description or "",
                fields=db_template.fields or []
            )
            templates.append(template)
        
        return templates
        
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch templates: {str(e)}")

@router.post("/templates", response_model=StandardResponse)
async def create_template(
    template_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new document template
    """
    try:
        # Create new template
        db_template = DBDocumentTemplate(
            id=template_data["id"],
            name=template_data["name"],
            template_type=template_data["type"],
            description=template_data.get("description", ""),
            content_template=template_data["content_template"],
            fields=template_data.get("fields", [])
        )
        
        db.add(db_template)
        await db.commit()
        
        return StandardResponse(message="Template created successfully")
        
    except Exception as e:
        logger.error(f"Error creating template: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

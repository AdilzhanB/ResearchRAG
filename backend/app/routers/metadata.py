from fastapi import APIRouter
from typing import List
from app.models.schemas import Jurisdiction, DocumentTypeInfo

router = APIRouter()

@router.get("/jurisdictions", response_model=List[Jurisdiction])
async def get_jurisdictions():
    """
    Get available jurisdictions
    """
    jurisdictions = [
        Jurisdiction(
            code="federal",
            name="Federal",
            type="federal",
            courts=["Supreme Court", "Circuit Courts", "District Courts"]
        ),
        Jurisdiction(
            code="ny",
            name="New York",
            type="state",
            courts=["Court of Appeals", "Supreme Court", "County Courts"]
        ),
        Jurisdiction(
            code="ca",
            name="California", 
            type="state",
            courts=["Supreme Court", "Courts of Appeal", "Superior Courts"]
        ),
        Jurisdiction(
            code="tx",
            name="Texas",
            type="state",
            courts=["Supreme Court", "Courts of Appeals", "District Courts"]
        ),
        Jurisdiction(
            code="fl",
            name="Florida",
            type="state",
            courts=["Supreme Court", "District Courts of Appeal", "Circuit Courts"]
        )
    ]
    return jurisdictions

@router.get("/document-types", response_model=List[DocumentTypeInfo])
async def get_document_types():
    """
    Get available document types
    """
    document_types = [
        DocumentTypeInfo(
            code="case_law",
            name="Case Law",
            description="Court decisions and judicial opinions"
        ),
        DocumentTypeInfo(
            code="statute",
            name="Statutes",
            description="Legislative acts and laws"
        ),
        DocumentTypeInfo(
            code="regulation",
            name="Regulations",
            description="Administrative rules and regulations"
        ),
        DocumentTypeInfo(
            code="brief",
            name="Legal Briefs",
            description="Court filings and legal arguments"
        ),
        DocumentTypeInfo(
            code="contract",
            name="Contracts",
            description="Legal agreements and contracts"
        )
    ]
    return document_types

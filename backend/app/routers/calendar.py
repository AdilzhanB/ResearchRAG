from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import logging
from datetime import datetime
from app.models.schemas import (
    DeadlineRequest,
    Deadline,
    StandardResponse
)
from app.models.database import Deadline as DBDeadline
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/deadlines", response_model=List[Deadline])
async def get_deadlines(
    user_id: int = 1,  # Would get from auth in production
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's deadlines
    """
    try:
        # Query database for user's deadlines
        query = select(DBDeadline).where(DBDeadline.user_id == user_id)
        result = await db.execute(query)
        db_deadlines = result.scalars().all()
        
        # Convert to response model
        deadlines = []
        for db_deadline in db_deadlines:
            deadline = Deadline(
                id=str(db_deadline.id),
                case_name=db_deadline.case_name,
                deadline_type=db_deadline.deadline_type,
                date=db_deadline.deadline_date.isoformat(),
                description=db_deadline.description or "",
                status=db_deadline.status,
                priority=db_deadline.priority,
                created_at=db_deadline.created_at,
                updated_at=db_deadline.updated_at
            )
            deadlines.append(deadline)
        
        return deadlines
        
    except Exception as e:
        logger.error(f"Error fetching deadlines: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch deadlines: {str(e)}")

@router.post("/deadlines", response_model=StandardResponse)
async def add_deadline(
    request: DeadlineRequest,
    user_id: int = 1,  # Would get from auth in production
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new deadline
    """
    try:
        # Parse date
        deadline_date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))
        
        # Create new deadline
        db_deadline = DBDeadline(
            user_id=user_id,
            case_name=request.case_name,
            deadline_type=request.deadline_type,
            deadline_date=deadline_date,
            description=request.description,
            priority=request.priority
        )
        
        db.add(db_deadline)
        await db.commit()
        
        return StandardResponse(
            message="Deadline added successfully",
            data={"id": str(db_deadline.id)}
        )
        
    except Exception as e:
        logger.error(f"Error adding deadline: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add deadline: {str(e)}")

@router.put("/deadlines/{deadline_id}", response_model=StandardResponse)
async def update_deadline(
    deadline_id: int,
    status: str,
    user_id: int = 1,  # Would get from auth in production
    db: AsyncSession = Depends(get_db)
):
    """
    Update deadline status
    """
    try:
        # Find deadline
        query = select(DBDeadline).where(
            and_(
                DBDeadline.id == deadline_id,
                DBDeadline.user_id == user_id
            )
        )
        result = await db.execute(query)
        db_deadline = result.scalar_one_or_none()
        
        if not db_deadline:
            raise HTTPException(status_code=404, detail="Deadline not found")
        
        # Update status
        db_deadline.status = status
        await db.commit()
        
        return StandardResponse(message="Deadline updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating deadline: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update deadline: {str(e)}")

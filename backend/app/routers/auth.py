from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta
import logging

from app.core.database import get_db
from app.services.auth_service import auth_service
from app.models.database import User
from app.models.user import (
    UserCreate, UserResponse, UserLogin, Token, 
    UserUpdate, PasswordReset, PasswordResetConfirm, 
    EmailVerification
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = auth_service.verify_token(token, "access")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = auth_service.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

# Optional authentication dependency
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        db_user = auth_service.create_user(db, user)
        logger.info(f"User registered successfully: {user.email}")
        return db_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return tokens"""
    user = auth_service.authenticate_user(db, user_login.email, user_login.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = auth_service.create_access_token(
        data={"user_id": user.id, "email": user.email}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"user_id": user.id, "email": user.email}
    )
    
    logger.info(f"User logged in: {user.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": auth_service.access_token_expire_minutes * 60
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    token = credentials.credentials
    payload = auth_service.verify_token(token, "refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("user_id")
    user = auth_service.get_user_by_id(db, user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = auth_service.create_access_token(
        data={"user_id": user.id, "email": user.email}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"user_id": user.id, "email": user.email}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": auth_service.access_token_expire_minutes * 60
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    updated_user = auth_service.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"User updated profile: {current_user.email}")
    return updated_user

@router.post("/upload-avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    if not avatar.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # For now, return a mock URL - in production, upload to cloud storage
    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={current_user.username}"
    
    user_update = UserUpdate(avatar_url=avatar_url)
    updated_user = auth_service.update_user(db, current_user.id, user_update)
    
    return {"avatar_url": avatar_url}

@router.post("/verify-email")
async def verify_email(
    verification: EmailVerification,
    db: Session = Depends(get_db)
):
    """Verify user email"""
    success = auth_service.verify_email(db, verification.token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(
    password_reset: PasswordReset,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    reset_token = auth_service.create_reset_token(db, password_reset.email)
    
    if not reset_token:
        # Don't reveal if email exists or not
        return {"message": "If email exists, reset instructions have been sent"}
    
    # In production, send email with reset token
    logger.info(f"Password reset requested for: {password_reset.email}")
    
    return {"message": "Password reset instructions sent to email"}

@router.post("/reset-password")
async def reset_password(
    password_reset: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    success = auth_service.reset_password(
        db, password_reset.token, password_reset.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    success = auth_service.change_password(
        db, current_user.id, current_password, new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    logger.info(f"Password changed for user: {current_user.email}")
    return {"message": "Password changed successfully"}

@router.delete("/delete-account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account (soft delete)"""
    success = auth_service.delete_user(db, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"Account deleted: {current_user.email}")
    return {"message": "Account deleted successfully"}

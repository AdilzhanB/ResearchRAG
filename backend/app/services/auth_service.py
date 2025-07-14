from datetime import datetime, timedelta
from typing import Optional, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.database import User
from app.models.user import UserCreate, UserUpdate
from app.core.config import settings
import secrets
import uuid
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Enhanced authentication service with JWT tokens and user management"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != token_type:
                return None
            return payload
        except JWTError:
            return None
    
    def create_user(self, db: Session, user: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.username == user.username)
        ).first()
        
        if existing_user:
            raise ValueError("User with this email or username already exists")
        
        # Create new user
        hashed_password = self.get_password_hash(user.password)
        verification_token = str(uuid.uuid4())
        
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=hashed_password,
            organization=user.organization,
            phone=user.phone,
            bio=user.bio,
            verification_token=verification_token,
            is_active=True,
            is_verified=False
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Log user creation
        logger.info(f"Created new user: {user.email}")
        
        return db_user
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """Delete user (soft delete by setting is_active to False)"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True
    
    def verify_email(self, db: Session, token: str) -> bool:
        """Verify user email with token"""
        user = db.query(User).filter(User.verification_token == token).first()
        if not user:
            return False
        
        user.is_verified = True
        user.verification_token = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True
    
    def create_reset_token(self, db: Session, email: str) -> Optional[str]:
        """Create password reset token"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        return reset_token
    
    def reset_password(self, db: Session, token: str, new_password: str) -> bool:
        """Reset user password with token"""
        user = db.query(User).filter(User.reset_token == token).first()
        if not user or not user.reset_token_expires:
            return False
        
        if datetime.utcnow() > user.reset_token_expires:
            return False
        
        user.hashed_password = self.get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True
    
    def change_password(self, db: Session, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        if not self.verify_password(current_password, user.hashed_password):
            return False
        
        user.hashed_password = self.get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True

# Global auth service instance
auth_service = AuthService()

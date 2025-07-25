import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_VERSION: str = "v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./legal_research.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Google Gemini
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-pro"
    
    # Vector Database (FAISS)
    VECTOR_DB_PATH: str = "./vector_db"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DIMENSION: int = 384
    
    # JWT
    SECRET_KEY: str = "your_super_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    WESTLAW_API_KEY: str = ""
    LEXISNEXIS_API_KEY: str = ""
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    UPLOAD_DIRECTORY: str = "./uploads"
    MAX_FILE_SIZE: str = "50MB"
    
    # Vector Store
    VECTORSTORE_PATH: str = "./vectorstore"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create settings instance
settings = Settings()

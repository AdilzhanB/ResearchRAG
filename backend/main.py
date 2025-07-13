from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import routers
from app.routers import search, analysis, citations, drafting, calendar, metadata, documents, agents
from app.core.config import settings
from app.core.security import verify_token
from app.core.database import init_db, close_db
from app.services.vector_service import VectorService
from app.services.gemini_service import GeminiService
from app.services.rag_pipeline import rag_pipeline

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Global services are imported as instances
# vector_service and gemini_service are already initialized

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    
    # Startup
    logger.info("Starting Legal Research API...")
    
    try:
        # Initialize database
        await init_db()
        
        # Initialize vector database
        await VectorService.initialize()
        
        # Initialize RAG pipeline
        if settings.GOOGLE_API_KEY:
            # Try to load existing vectorstore
            try:
                rag_pipeline.load_vectorstore(settings.VECTORSTORE_PATH)
                logger.info("Loaded existing RAG vectorstore")
            except Exception as e:
                logger.warning(f"Could not load existing vectorstore: {e}")
                logger.info("RAG pipeline will be initialized when documents are uploaded")
        else:
            logger.warning("GOOGLE_API_KEY not set, RAG pipeline will have limited functionality")
        
        logger.info("Services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Legal Research API...")
    
    await VectorService.close()
    await close_db()

# Create FastAPI app
app = FastAPI(
    title="Legal Research Assistant API",
    description="Advanced legal research and analysis powered by AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    try:
        token = credentials.credentials
        payload = verify_token(token)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Legal Research Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Include routers
app.include_router(
    search.router,
    prefix="/api/search",
    tags=["search"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    analysis.router,
    prefix="/api/analysis",
    tags=["analysis"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    citations.router,
    prefix="/api/citations",
    tags=["citations"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    drafting.router,
    prefix="/api/drafting",
    tags=["drafting"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    calendar.router,
    prefix="/api/calendar",
    tags=["calendar"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    metadata.router,
    prefix="/api/metadata",
    tags=["metadata"]
)

app.include_router(
    documents.router,
    prefix="/api/documents",
    tags=["documents"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

app.include_router(
    agents.router,
    prefix="/api/agents",
    tags=["agents"],
    dependencies=[Depends(get_current_user)] if settings.ENVIRONMENT == "production" else []
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )

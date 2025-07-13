<div align="center">

# 🔧 Legal Research Assistant - Backend API

<img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI">
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" alt="LangChain">
<img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini">

**🚀 High-performance FastAPI backend with advanced RAG capabilities, AI agent orchestration, and intelligent document processing.**

[🔌 API Docs](http://localhost:8000/docs) • [🔍 Redoc](http://localhost:8000/redoc) • [📊 Health Check](http://localhost:8000/health)

---

</div>

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "API Layer"
        A[FastAPI Application] --> B[Authentication Middleware]
        B --> C[Rate Limiting]
        C --> D[CORS Handler]
    end
    
    subgraph "Business Logic"
        D --> E[Document Router]
        D --> F[Search Router]
        D --> G[Agents Router]
        D --> H[Analysis Router]
    end
    
    subgraph "AI Services"
        E --> I[RAG Pipeline]
        I --> J[LangChain Orchestration]
        J --> K[Google Gemini LLM]
        J --> L[Document Loaders]
        L --> M[Text Splitters]
        M --> N[Vector Embeddings]
    end
    
    subgraph "Data Layer"
        N --> O[FAISS Vector Store]
        E --> P[SQLAlchemy ORM]
        P --> Q[SQLite/PostgreSQL]
        I --> R[Redis Cache]
    end
```

## 🎯 Core Features

### 🧠 Advanced RAG Pipeline

<table>
<tr>
<td width="50%">

**🔄 Document Processing**
- Multi-format support (PDF, DOC, DOCX, TXT)
- Intelligent text chunking with overlap
- Automatic metadata extraction
- Background processing with Celery

</td>
<td width="50%">

**🔍 Vector Search**
- FAISS similarity search
- Sentence Transformers embeddings
- Semantic similarity ranking
- Real-time indexing

</td>
</tr>
<tr>
<td width="50%">

**🤖 AI Orchestration**
- LangChain agent framework
- Google Gemini integration
- Custom tool implementations
- Multi-step reasoning workflows

</td>
<td width="50%">

**⚡ Performance**
- Async/await throughout
- Connection pooling
- Response caching
- Background task processing

</td>
</tr>
</table>

## 📁 Project Structure

```
backend/
├── 🚀 main.py                 # FastAPI application entry point
├── 📋 requirements.txt        # Python dependencies
├── 🎵 pyproject.toml         # Poetry configuration
├── 🔧 init_db.py            # Database initialization
├── 📝 .env.example          # Environment variables template
├── 🔄 start_backend.sh      # Startup script (Unix)
├── 🪟 start_backend.bat     # Startup script (Windows)
│
├── 📂 app/                   # Application package
│   ├── 🏗️ core/             # Core configuration
│   │   ├── config.py         # Settings and configuration
│   │   ├── database.py       # Database connection setup
│   │   └── security.py       # Authentication and security
│   │
│   ├── 📊 models/            # Data models
│   │   ├── database.py       # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   │
│   ├── 🛣️ routers/           # API endpoints
│   │   ├── search.py         # Document search endpoints
│   │   ├── documents.py      # Document management
│   │   ├── agents.py         # AI agent tools
│   │   ├── analysis.py       # Legal analysis
│   │   ├── citations.py      # Citation formatting
│   │   ├── drafting.py       # Document drafting
│   │   ├── calendar.py       # Calendar and deadlines
│   │   └── metadata.py       # Metadata endpoints
│   │
│   └── 🔧 services/          # Business logic
│       ├── rag_pipeline.py   # RAG implementation
│       ├── vector_service.py # Vector database
│       └── gemini_service.py # Google Gemini integration
│
├── 📁 uploads/               # Document storage
├── 🗄️ vectorstore/          # FAISS vector database
├── 📊 logs/                  # Application logs
└── 🧪 tests/                 # Test suite
```

## 🚀 Quick Start

### 📋 Prerequisites

```bash
# Python 3.9+
python --version

# Poetry (recommended) or pip
curl -sSL https://install.python-poetry.org | python3 -
```

### ⚡ Installation

<details>
<summary><strong>🎵 With Poetry (Recommended)</strong></summary>

```bash
# Install dependencies
poetry install

# Activate virtual environment
poetry shell

# Install development dependencies
poetry install --with dev
```

</details>

<details>
<summary><strong>🐍 With pip</strong></summary>

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

</details>

### 🔧 Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**

```bash
# Google Gemini API (Required)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///./legal_research.db
# For production: postgresql+asyncpg://user:pass@localhost/dbname

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256

# File Storage
UPLOAD_DIRECTORY=./uploads
VECTORSTORE_PATH=./vectorstore

# Development Settings
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
```

### 🗄️ Database Setup

```bash
# Initialize database with sample data
poetry run python init_db.py

# Or with custom configuration
ENVIRONMENT=production poetry run python init_db.py
```

### 🏃‍♂️ Running the Server

<table>
<tr>
<td width="50%">

**🔧 Development Mode**
```bash
# Using Poetry
poetry run python main.py

# Using script
./start_backend.sh

# With auto-reload
poetry run uvicorn main:app --reload
```

</td>
<td width="50%">

**🚀 Production Mode**
```bash
# Set production environment
export ENVIRONMENT=production

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Or with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

</td>
</tr>
</table>

## 🔌 API Documentation

### 📊 Interactive Documentation

| Documentation | URL | Description |
|---------------|-----|-------------|
| 📚 **Swagger UI** | http://localhost:8000/docs | Interactive API explorer |
| 📖 **ReDoc** | http://localhost:8000/redoc | Alternative documentation |
| 🔍 **OpenAPI JSON** | http://localhost:8000/openapi.json | Raw OpenAPI specification |

### 🛣️ API Endpoints Overview

<details>
<summary><strong>📄 Document Management</strong></summary>

```http
POST   /api/documents/upload
Content-Type: multipart/form-data

# Upload multiple documents
curl -X POST "http://localhost:8000/api/documents/upload" \
     -F "files=@document1.pdf" \
     -F "files=@document2.docx"
```

```http
GET    /api/documents/documents?limit=50&offset=0
# List uploaded documents with pagination

DELETE /api/documents/documents/{document_id}
# Delete specific document

POST   /api/documents/query
Content-Type: application/json
{
  "query": "What are the key provisions in the contract?",
  "use_conversation": true,
  "use_agent": false
}
# RAG query interface

GET    /api/documents/search/{query}?limit=5
# Semantic similarity search

GET    /api/documents/stats
# RAG pipeline statistics
```

</details>

<details>
<summary><strong>🤖 AI Agent Tools</strong></summary>

```http
GET    /api/agents/tools
# List all available agent tools

POST   /api/agents/execute
Content-Type: application/json
{
  "tool_name": "wikipedia_search",
  "query": "adverse possession legal concept",
  "parameters": {}
}
# Execute specific agent tool

POST   /api/agents/research-workflow
Content-Type: application/json
{
  "query": "employment discrimination law",
  "include_cases": true,
  "include_statutes": true,
  "include_wikipedia": true,
  "jurisdiction": "federal"
}
# Run comprehensive research workflow

GET    /api/agents/workflow-templates
# Available workflow templates
```

</details>

<details>
<summary><strong>🔍 Search & Analysis</strong></summary>

```http
POST   /api/search/documents
Content-Type: application/json
{
  "query": "contract breach",
  "jurisdictions": ["federal", "california"],
  "document_types": ["case_law", "statute"],
  "limit": 20
}
# Advanced document search

POST   /api/analysis/case
Content-Type: application/json
{
  "document_id": "123",
  "analysis_type": "full",
  "include_holdings": true,
  "include_issues": true
}
# Legal case analysis

POST   /api/citations/format
Content-Type: application/json
{
  "text": "Smith v. Jones, 123 F.3d 456 (9th Cir. 2023)",
  "citation_style": "bluebook",
  "jurisdiction": "federal"
}
# Citation formatting
```

</details>

## 🧪 Testing

### 🔬 Running Tests

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_rag_pipeline.py

# Run with verbose output
poetry run pytest -v
```

### 📊 Test Coverage

```bash
# Generate coverage report
poetry run pytest --cov=app --cov-report=term-missing

# View HTML coverage report
open htmlcov/index.html
```

## 🔧 Development

### 🛠️ Code Quality

```bash
# Format code with Black
poetry run black app/

# Sort imports with isort
poetry run isort app/

# Lint with flake8
poetry run flake8 app/

# Type checking with mypy
poetry run mypy app/

# Run all quality checks
poetry run black app/ && poetry run isort app/ && poetry run flake8 app/ && poetry run mypy app/
```

### 🔍 Debugging

<details>
<summary><strong>🐛 Common Debug Commands</strong></summary>

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Test database connection
poetry run python -c "from app.core.database import test_connection; test_connection()"

# Test Gemini API connection
poetry run python -c "from app.services.gemini_service import test_gemini; test_gemini()"

# Check RAG pipeline status
curl http://localhost:8000/api/documents/stats
```

</details>

### 📝 Adding New Features

<details>
<summary><strong>🔧 Adding New Agent Tool</strong></summary>

1. **Create tool function** in `app/routers/agents.py`:

```python
@staticmethod
def my_custom_tool(query: str, **kwargs) -> str:
    """Custom legal analysis tool"""
    try:
        # Your tool logic here
        result = perform_analysis(query)
        return result
    except Exception as e:
        return f"Error: {e}"
```

2. **Add to tools mapping**:

```python
AVAILABLE_TOOLS = {
    # ... existing tools
    "my_custom_tool": LegalAgentTools.my_custom_tool,
}
```

3. **Test the new tool**:

```bash
curl -X POST "http://localhost:8000/api/agents/execute" \
     -H "Content-Type: application/json" \
     -d '{"tool_name": "my_custom_tool", "query": "test query"}'
```

</details>

<details>
<summary><strong>📄 Adding New Document Loader</strong></summary>

1. **Extend RAG pipeline** in `app/services/rag_pipeline.py`:

```python
def add_documents_from_files(self, file_paths: List[str]) -> List[Document]:
    # Add support for new file format
    elif file_path.suffix.lower() == '.your_format':
        loader = YourCustomLoader(str(file_path))
```

2. **Update file validation** in `app/routers/documents.py`:

```python
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx', '.your_format'}
```

</details>

## 🚀 Deployment

### 🐳 Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads vectorstore logs

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run with Docker
docker build -t legal-backend .
docker run -p 8000:8000 -e GOOGLE_API_KEY=$GOOGLE_API_KEY legal-backend
```

### ⚙️ Environment-Specific Configurations

<details>
<summary><strong>🔧 Development Configuration</strong></summary>

```python
# app/core/config.py
class DevelopmentSettings(Settings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    DATABASE_URL: str = "sqlite+aiosqlite:///./legal_research.db"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
```

</details>

<details>
<summary><strong>🚀 Production Configuration</strong></summary>

```python
class ProductionSettings(Settings):
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/legal_db"
    CORS_ORIGINS: List[str] = ["https://yourdomain.com"]
    RATE_LIMIT_PER_MINUTE: int = 100
```

</details>

## 📊 Monitoring & Logging

### 📈 Health Checks

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed system status
curl http://localhost:8000/api/metadata/system-info
```

### 📋 Logging Configuration

```python
# app/core/config.py
LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "formatter": "default",
            "class": "logging.FileHandler",
            "filename": "logs/app.log",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["default", "file"],
    },
}
```

## 🔒 Security

### 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Pydantic schema validation
- **File Upload Security**: Type and size validation
- **SQL Injection Prevention**: SQLAlchemy ORM protection

### 🔐 Security Best Practices

```python
# Environment variables for sensitive data
SECRET_KEY=os.getenv("SECRET_KEY")
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")

# Secure headers
from fastapi.middleware.trustedhost import TrustedHostMiddleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com", "*.example.com"])

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

## 🤝 Contributing

### 📋 Development Setup

```bash
# Fork the repository and clone
git clone https://github.com/your-username/legal-research-assistant.git
cd legal-research-assistant/backend

# Install development dependencies
poetry install --with dev

# Install pre-commit hooks
pre-commit install

# Create feature branch
git checkout -b feature/your-feature-name
```

### ✅ Pre-commit Checklist

- [ ] Run tests: `poetry run pytest`
- [ ] Check formatting: `poetry run black --check app/`
- [ ] Check imports: `poetry run isort --check-only app/`
- [ ] Run linting: `poetry run flake8 app/`
- [ ] Type checking: `poetry run mypy app/`
- [ ] Update documentation if needed

## 📚 Additional Resources

- 📖 [FastAPI Documentation](https://fastapi.tiangolo.com/)
- 🦜 [LangChain Documentation](https://python.langchain.com/)
- 🤖 [Google Gemini API Guide](https://ai.google.dev/docs)
- 🔍 [FAISS Documentation](https://faiss.ai/)
- 🗄️ [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

**🚀 Built with ❤️ for the legal community**

[⬆ Back to Top](#legal-research-assistant---backend-api)

</div>

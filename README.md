# Legal Research Assistant MVP

An intelligent legal research platform powered by AI, featuring advanced RAG (Retrieval Augmented Generation) capabilities with LangChain, Google Gemini, and modern web technologies.

## Features

- **Advanced Search**: AI-enhanced legal document search with semantic similarity
- **Case Analysis**: Comprehensive case analysis with precedent identification and conflict checking
- **Document Drafting**: AI-powered legal document generation from templates
- **Citation Management**: Automated citation formatting and validation
- **Calendar Integration**: Deadline tracking and case management
- **Vector Search**: FAISS-powered semantic search across legal documents

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLite**: Database for structured data
- **FAISS**: Vector database for semantic search
- **LangChain**: AI framework for document processing
- **Google Gemini**: Large language model for AI capabilities
- **Sentence Transformers**: Text embeddings

### Frontend
- **React + TypeScript**: Modern web framework
- **Tailwind CSS**: Utility-first CSS framework
- **Material-UI**: Component library
- **Zustand**: State management
- **Framer Motion**: Animations
- **Axios**: HTTP client

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Poetry (Python package manager)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
poetry install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Initialize the database:
```bash
poetry run python init_db.py
```

5. Start the server:
```bash
poetry run uvicorn main:app --reload
```

Or use the startup script:
- Windows: `start_backend.bat`
- Linux/Mac: `bash start_backend.sh`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

4. Start the development server:
```bash
npm run dev
```

Or use the startup script:
- Windows: `start_frontend.bat`

## Configuration

### Environment Variables

#### Backend (.env)
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `DATABASE_URL`: SQLite database path (default: sqlite+aiosqlite:///./legal_research.db)
- `VECTOR_DB_PATH`: FAISS vector database directory
- `SECRET_KEY`: JWT secret key
- `ALLOWED_ORIGINS`: Frontend URLs for CORS

#### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features Explained

### 1. Semantic Search
- Uses Sentence Transformers to create embeddings
- FAISS vector database for efficient similarity search
- AI-enhanced query expansion with Google Gemini

### 2. Legal Document Analysis
- Automatic extraction of key holdings and legal issues
- Precedent identification and conflict detection
- Similarity scoring between cases

### 3. AI-Powered Document Generation
- Template-based document creation
- Context-aware legal language generation
- Customizable document templates

### 4. Citation Management
- Multi-format citation support (Bluebook, APA, MLA)
- Automatic citation validation
- Format standardization

## Project Structure

```
legal-research-assistant/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration and database
│   │   ├── models/        # Database models and schemas
│   │   ├── routers/       # API endpoints
│   │   └── services/      # Business logic (AI, vector DB)
│   ├── main.py           # FastAPI application
│   ├── init_db.py        # Database initialization
│   └── pyproject.toml    # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── services/      # API clients
    │   ├── store/         # State management
    │   └── types/         # TypeScript types
    ├── package.json      # Node.js dependencies
    └── vite.config.ts    # Vite configuration
```

## Development

### Adding New Legal Documents
1. Add documents via the admin interface (planned)
2. Use the `/api/search/reindex` endpoint to rebuild the vector index
3. Documents are automatically embedded and indexed

### Extending AI Capabilities
- Modify `gemini_service.py` to add new AI features
- Update schemas in `models/schemas.py` for new data types
- Add corresponding API endpoints in the routers

### Customizing the Frontend
- Components are in `src/components/`
- State management uses Zustand stores
- Styling with Tailwind CSS and Material-UI

## Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite for better performance
- Implement proper authentication and authorization
- Set up monitoring and logging
- Use Redis for caching and session storage
- Deploy with Docker for containerization

### Security
- JWT tokens for authentication
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Rate limiting (planned)

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For questions and support, please open an issue on GitHub.

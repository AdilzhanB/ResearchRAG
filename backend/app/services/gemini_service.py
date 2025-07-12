import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        self.model = None
        self._initialize_gemini()
    
    def _initialize_gemini(self):
        """Initialize Gemini API"""
        try:
            if not settings.GOOGLE_API_KEY:
                logger.warning("GOOGLE_API_KEY not set. Gemini service will use mock responses.")
                return
            
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info("Gemini service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.model = None
    
    async def generate_search_query(self, user_query: str, context: Optional[str] = None) -> str:
        """Generate optimized search query using Gemini"""
        if not self.model:
            return user_query
        
        prompt = f"""
        You are a legal research expert. Convert this user query into an optimized legal search query.
        
        User Query: {user_query}
        Context: {context or "None"}
        
        Create a precise legal search query that will find the most relevant documents.
        Focus on legal terminology, case names, statutes, and relevant keywords.
        
        Return only the optimized search query, no explanation.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating search query: {e}")
            return user_query
    
    async def analyze_legal_document(self, document_content: str, analysis_type: str) -> Dict[str, Any]:
        """Analyze legal document content"""
        if not self.model:
            return self._mock_analysis(document_content, analysis_type)
        
        prompt = f"""
        You are a legal expert. Analyze this legal document and provide insights.
        
        Document Content: {document_content[:3000]}...
        Analysis Type: {analysis_type}
        
        Provide analysis in the following JSON format:
        {{
            "key_holdings": ["holding1", "holding2"],
            "legal_issues": ["issue1", "issue2"],
            "precedents_mentioned": ["case1", "case2"],
            "legal_principles": ["principle1", "principle2"],
            "summary": "Brief summary of the document"
        }}
        
        Return only valid JSON, no additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            return self._mock_analysis(document_content, analysis_type)
    
    async def check_case_conflicts(self, cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Check for conflicts between legal cases"""
        if not self.model or len(cases) < 2:
            return []
        
        case_summaries = []
        for case in cases[:5]:  # Limit to 5 cases to avoid token limits
            case_summaries.append(f"Case {case.get('id', 'unknown')}: {case.get('title', 'Unknown')} - {case.get('content', '')[:500]}")
        
        prompt = f"""
        You are a legal expert. Analyze these legal cases for conflicts, contradictions, or competing precedents.
        
        Cases:
        {chr(10).join(case_summaries)}
        
        Identify conflicts in the following JSON format:
        {{
            "conflicts": [
                {{
                    "doc1": "case_id_1",
                    "doc2": "case_id_2",
                    "conflict_type": "contradictory_holding",
                    "description": "Description of the conflict",
                    "severity": "high"
                }}
            ]
        }}
        
        Severity levels: low, medium, high
        Conflict types: contradictory_holding, different_interpretation, jurisdictional_conflict, overruled_precedent
        
        Return only valid JSON, no additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json
            result = json.loads(response.text.strip())
            return result.get("conflicts", [])
        except Exception as e:
            logger.error(f"Error checking conflicts: {e}")
            return []
    
    async def format_legal_citation(self, citation_text: str, style: str = "bluebook") -> Dict[str, Any]:
        """Format legal citation according to specified style"""
        if not self.model:
            return {"formatted_citation": citation_text, "citation_errors": []}
        
        prompt = f"""
        You are a legal citation expert. Format this citation according to {style.upper()} style.
        
        Citation: {citation_text}
        Style: {style}
        
        Provide response in JSON format:
        {{
            "formatted_citation": "properly formatted citation",
            "citation_errors": ["error1", "error2"] // if any
        }}
        
        Return only valid JSON, no additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.error(f"Error formatting citation: {e}")
            return {"formatted_citation": citation_text, "citation_errors": []}
    
    async def generate_legal_document(self, template_type: str, case_info: Dict[str, Any], 
                                    arguments: List[str], supporting_cases: List[str]) -> Dict[str, Any]:
        """Generate legal document based on template and information"""
        if not self.model:
            return self._mock_document_generation(template_type, case_info)
        
        prompt = f"""
        You are a legal writing expert. Generate a {template_type} document with the following information:
        
        Case Information: {case_info}
        Key Arguments: {', '.join(arguments)}
        Supporting Cases: {', '.join(supporting_cases)}
        
        Create a professional legal document following standard {template_type} format.
        Include proper legal language, structure, and citations.
        
        Provide response in JSON format:
        {{
            "document": "full document text",
            "suggestions": ["suggestion1", "suggestion2"],
            "word_count": 1500
        }}
        
        Return only valid JSON, no additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.error(f"Error generating document: {e}")
            return self._mock_document_generation(template_type, case_info)
    
    def _mock_analysis(self, content: str, analysis_type: str) -> Dict[str, Any]:
        """Mock analysis for when Gemini is not available"""
        return {
            "key_holdings": ["Mock holding based on document analysis"],
            "legal_issues": ["Constitutional law", "Due process"],
            "precedents_mentioned": ["Brown v. Board", "Miranda v. Arizona"],
            "legal_principles": ["Equal protection", "Constitutional interpretation"],
            "summary": "This is a mock analysis of the legal document."
        }
    
    def _mock_document_generation(self, template_type: str, case_info: Dict[str, Any]) -> Dict[str, Any]:
        """Mock document generation for when Gemini is not available"""
        return {
            "document": f"MOCK {template_type.upper()}\n\nThis is a mock {template_type} document generated for demonstration purposes.\n\nCase: {case_info.get('case_name', 'Unknown Case')}\nCourt: {case_info.get('court', 'Unknown Court')}\n\nThis document would contain the full legal brief in a production environment.",
            "suggestions": [
                "Add more supporting precedents",
                "Strengthen constitutional arguments",
                "Include jurisdictional analysis"
            ],
            "word_count": 750
        }

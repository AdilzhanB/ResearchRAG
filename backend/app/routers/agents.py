from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
from datetime import datetime

from app.models.schemas import AgentToolRequest, AgentToolResponse
from app.services.rag_pipeline import rag_pipeline
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class LegalAgentTools:
    """Collection of AI agent tools for legal research"""
    
    @staticmethod
    def wikipedia_search(query: str, **kwargs) -> str:
        """Search Wikipedia for legal topics"""
        try:
            # This will use the Wikipedia tool from the RAG pipeline
            response = rag_pipeline.agent_query(f"Search Wikipedia for: {query}")
            return response.get("answer", "No Wikipedia results found")
        except Exception as e:
            logger.error(f"Wikipedia search error: {e}")
            return f"Error searching Wikipedia: {e}"
    
    @staticmethod
    def legal_case_search(query: str, jurisdiction: str = None, **kwargs) -> str:
        """Search for legal cases and precedents"""
        try:
            search_query = f"Find legal cases about: {query}"
            if jurisdiction:
                search_query += f" in {jurisdiction} jurisdiction"
            
            # Use the agent to search for cases
            response = rag_pipeline.agent_query(search_query)
            return response.get("answer", "No legal cases found")
        except Exception as e:
            logger.error(f"Legal case search error: {e}")
            return f"Error searching legal cases: {e}"
    
    @staticmethod
    def statute_search(query: str, jurisdiction: str = None, **kwargs) -> str:
        """Search for statutes and regulations"""
        try:
            search_query = f"Find statutes and regulations about: {query}"
            if jurisdiction:
                search_query += f" in {jurisdiction}"
            
            response = rag_pipeline.agent_query(search_query)
            return response.get("answer", "No statutes found")
        except Exception as e:
            logger.error(f"Statute search error: {e}")
            return f"Error searching statutes: {e}"
    
    @staticmethod
    def citation_format(text: str, style: str = "bluebook", **kwargs) -> str:
        """Format legal citations"""
        try:
            format_query = f"Format this legal citation in {style} style: {text}"
            response = rag_pipeline.agent_query(format_query)
            return response.get("answer", "Could not format citation")
        except Exception as e:
            logger.error(f"Citation formatting error: {e}")
            return f"Error formatting citation: {e}"
    
    @staticmethod
    def legal_analysis(text: str, analysis_type: str = "general", **kwargs) -> str:
        """Perform legal analysis on text"""
        try:
            if analysis_type == "precedent":
                analysis_query = f"Analyze this legal text for precedents and case law: {text}"
            elif analysis_type == "conflict":
                analysis_query = f"Analyze this legal text for conflicts and contradictions: {text}"
            elif analysis_type == "similarity":
                analysis_query = f"Find similar legal concepts and cases for: {text}"
            else:
                analysis_query = f"Perform a comprehensive legal analysis of: {text}"
            
            response = rag_pipeline.agent_query(analysis_query)
            return response.get("answer", "Could not perform analysis")
        except Exception as e:
            logger.error(f"Legal analysis error: {e}")
            return f"Error performing legal analysis: {e}"
    
    @staticmethod
    def document_summary(text: str, **kwargs) -> str:
        """Summarize legal documents"""
        try:
            summary_query = f"Provide a comprehensive summary of this legal document: {text}"
            response = rag_pipeline.agent_query(summary_query)
            return response.get("answer", "Could not summarize document")
        except Exception as e:
            logger.error(f"Document summary error: {e}")
            return f"Error summarizing document: {e}"
    
    @staticmethod
    def deadline_analysis(text: str, **kwargs) -> str:
        """Extract and analyze deadlines from legal text"""
        try:
            deadline_query = f"Extract and analyze all deadlines, time limits, and important dates from this legal text: {text}"
            response = rag_pipeline.agent_query(deadline_query)
            return response.get("answer", "No deadlines found")
        except Exception as e:
            logger.error(f"Deadline analysis error: {e}")
            return f"Error analyzing deadlines: {e}"
    
    @staticmethod
    def contract_analysis(text: str, **kwargs) -> str:
        """Analyze contracts for key terms and risks"""
        try:
            contract_query = f"Analyze this contract for key terms, obligations, risks, and important clauses: {text}"
            response = rag_pipeline.agent_query(contract_query)
            return response.get("answer", "Could not analyze contract")
        except Exception as e:
            logger.error(f"Contract analysis error: {e}")
            return f"Error analyzing contract: {e}"

# Available tools mapping
AVAILABLE_TOOLS = {
    "wikipedia_search": LegalAgentTools.wikipedia_search,
    "legal_case_search": LegalAgentTools.legal_case_search,
    "statute_search": LegalAgentTools.statute_search,
    "citation_format": LegalAgentTools.citation_format,
    "legal_analysis": LegalAgentTools.legal_analysis,
    "document_summary": LegalAgentTools.document_summary,
    "deadline_analysis": LegalAgentTools.deadline_analysis,
    "contract_analysis": LegalAgentTools.contract_analysis,
}

@router.get("/tools")
async def list_available_tools():
    """List all available agent tools"""
    tools_info = []
    
    for tool_name, tool_func in AVAILABLE_TOOLS.items():
        tools_info.append({
            "name": tool_name,
            "description": tool_func.__doc__ or "No description available",
            "parameters": {
                "query": "string (required)",
                "jurisdiction": "string (optional, for legal searches)",
                "style": "string (optional, for citation formatting)",
                "analysis_type": "string (optional, for legal analysis)"
            }
        })
    
    return {
        "tools": tools_info,
        "total_tools": len(tools_info)
    }

@router.post("/execute", response_model=AgentToolResponse)
async def execute_tool(request: AgentToolRequest):
    """Execute a specific agent tool"""
    
    if not request.tool_name:
        raise HTTPException(status_code=400, detail="Tool name is required")
    
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    if request.tool_name not in AVAILABLE_TOOLS:
        raise HTTPException(
            status_code=404, 
            detail=f"Tool '{request.tool_name}' not found. Available tools: {list(AVAILABLE_TOOLS.keys())}"
        )
    
    try:
        # Get the tool function
        tool_func = AVAILABLE_TOOLS[request.tool_name]
        
        # Execute the tool with parameters
        result = tool_func(
            query=request.query,
            **(request.parameters or {})
        )
        
        return AgentToolResponse(
            tool_name=request.tool_name,
            result=result,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Error executing tool {request.tool_name}: {e}")
        return AgentToolResponse(
            tool_name=request.tool_name,
            result="",
            success=False,
            error=str(e)
        )

@router.post("/batch-execute")
async def batch_execute_tools(requests: list[AgentToolRequest]):
    """Execute multiple agent tools in sequence"""
    
    if len(requests) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 tools can be executed in batch")
    
    results = []
    
    for request in requests:
        try:
            if request.tool_name not in AVAILABLE_TOOLS:
                results.append(AgentToolResponse(
                    tool_name=request.tool_name,
                    result="",
                    success=False,
                    error=f"Tool '{request.tool_name}' not found"
                ))
                continue
            
            tool_func = AVAILABLE_TOOLS[request.tool_name]
            result = tool_func(
                query=request.query,
                **(request.parameters or {})
            )
            
            results.append(AgentToolResponse(
                tool_name=request.tool_name,
                result=result,
                success=True
            ))
            
        except Exception as e:
            logger.error(f"Error in batch execution for tool {request.tool_name}: {e}")
            results.append(AgentToolResponse(
                tool_name=request.tool_name,
                result="",
                success=False,
                error=str(e)
            ))
    
    return {
        "results": results,
        "total_executed": len(results),
        "successful": len([r for r in results if r.success]),
        "failed": len([r for r in results if not r.success])
    }

@router.post("/research-workflow")
async def execute_research_workflow(
    query: str,
    include_cases: bool = True,
    include_statutes: bool = True,
    include_wikipedia: bool = True,
    jurisdiction: str = None
):
    """Execute a complete legal research workflow"""
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        workflow_results = {}
        
        # Step 1: Wikipedia research for background
        if include_wikipedia:
            wikipedia_result = LegalAgentTools.wikipedia_search(query)
            workflow_results["wikipedia"] = wikipedia_result
        
        # Step 2: Legal case search
        if include_cases:
            case_result = LegalAgentTools.legal_case_search(query, jurisdiction)
            workflow_results["cases"] = case_result
        
        # Step 3: Statute search
        if include_statutes:
            statute_result = LegalAgentTools.statute_search(query, jurisdiction)
            workflow_results["statutes"] = statute_result
        
        # Step 4: Comprehensive analysis
        analysis_query = f"Based on the research for '{query}', provide a comprehensive legal analysis"
        analysis_result = LegalAgentTools.legal_analysis(analysis_query)
        workflow_results["analysis"] = analysis_result
        
        # Step 5: Generate summary
        summary_query = f"Summarize the key findings from this legal research on: {query}"
        summary_result = rag_pipeline.agent_query(summary_query)
        workflow_results["summary"] = summary_result.get("answer", "Could not generate summary")
        
        return {
            "query": query,
            "workflow_results": workflow_results,
            "completed_steps": list(workflow_results.keys()),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in research workflow: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")

@router.get("/workflow-templates")
async def get_workflow_templates():
    """Get available research workflow templates"""
    templates = [
        {
            "name": "basic_research",
            "description": "Basic legal research with cases and statutes",
            "steps": ["wikipedia_search", "legal_case_search", "statute_search", "legal_analysis"]
        },
        {
            "name": "contract_review",
            "description": "Comprehensive contract analysis workflow",
            "steps": ["document_summary", "contract_analysis", "deadline_analysis", "legal_analysis"]
        },
        {
            "name": "case_prep",
            "description": "Case preparation and precedent research",
            "steps": ["legal_case_search", "legal_analysis", "citation_format", "document_summary"]
        },
        {
            "name": "compliance_check",
            "description": "Regulatory compliance research",
            "steps": ["statute_search", "legal_analysis", "deadline_analysis"]
        }
    ]
    
    return {
        "templates": templates,
        "total_templates": len(templates)
    }

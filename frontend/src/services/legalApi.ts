import axios from 'axios';
import type { LegalDocument, SearchResult, CaseAnalysis } from '../store/legalStore';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth if needed
api.interceptors.request.use(
  (config: any) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export interface SearchParams {
  query: string;
  jurisdictions?: string[];
  document_types?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

export interface AnalysisParams {
  document_id: string;
  analysis_type: 'precedent' | 'conflict' | 'similarity' | 'full';
  include_holdings?: boolean;
  include_issues?: boolean;
}

export interface CitationParams {
  text: string;
  citation_style: 'bluebook' | 'apa' | 'mla';
  jurisdiction?: string;
}

export interface DocumentDraftParams {
  template_type: 'brief' | 'motion' | 'contract' | 'memo';
  case_info?: {
    case_name: string;
    court: string;
    docket_number: string;
  };
  key_arguments?: string[];
  supporting_cases?: string[];
}

class LegalApiService {
  // Search and retrieval
  async searchDocuments(params: SearchParams): Promise<SearchResult> {
    try {
      const response = await api.post('/api/search/documents', params);
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async getDocument(documentId: string): Promise<LegalDocument> {
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async getSimilarDocuments(documentId: string, limit: number = 10): Promise<LegalDocument[]> {
    try {
      const response = await api.get(`/api/documents/${documentId}/similar?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar documents:', error);
      throw error;
    }
  }

  // Analysis
  async analyzeCase(params: AnalysisParams): Promise<CaseAnalysis> {
    try {
      const response = await api.post('/api/analysis/case', params);
      return response.data;
    } catch (error) {
      console.error('Error analyzing case:', error);
      throw error;
    }
  }

  async checkConflicts(documentIds: string[]): Promise<{
    conflicts: Array<{
      doc1: string;
      doc2: string;
      conflict_type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    try {
      const response = await api.post('/api/analysis/conflicts', { document_ids: documentIds });
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      throw error;
    }
  }

  // Citations
  async formatCitations(params: CitationParams): Promise<{
    formatted_citation: string;
    citation_errors: string[];
  }> {
    try {
      const response = await api.post('/api/citations/format', params);
      return response.data;
    } catch (error) {
      console.error('Error formatting citations:', error);
      throw error;
    }
  }

  async validateCitations(text: string): Promise<{
    citations: Array<{
      citation: string;
      valid: boolean;
      errors: string[];
      suggestions: string[];
    }>;
  }> {
    try {
      const response = await api.post('/api/citations/validate', { text });
      return response.data;
    } catch (error) {
      console.error('Error validating citations:', error);
      throw error;
    }
  }

  // Document drafting
  async generateDocument(params: DocumentDraftParams): Promise<{
    document: string;
    suggestions: string[];
    template_used: string;
  }> {
    try {
      const response = await api.post('/api/drafting/generate', params);
      return response.data;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  async getDraftingTemplates(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  }>> {
    try {
      const response = await api.get('/api/drafting/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Calendar and deadlines
  async getDeadlines(): Promise<Array<{
    id: string;
    case_name: string;
    deadline_type: string;
    date: string;
    description: string;
    status: 'pending' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
  }>> {
    try {
      const response = await api.get('/api/calendar/deadlines');
      return response.data;
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }
  }

  async addDeadline(deadline: {
    case_name: string;
    deadline_type: string;
    date: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<{ id: string }> {
    try {
      const response = await api.post('/api/calendar/deadlines', deadline);
      return response.data;
    } catch (error) {
      console.error('Error adding deadline:', error);
      throw error;
    }
  }

  // Jurisdictions and metadata
  async getJurisdictions(): Promise<Array<{
    code: string;
    name: string;
    type: 'federal' | 'state' | 'local';
    courts: string[];
  }>> {
    try {
      const response = await api.get('/api/metadata/jurisdictions');
      return response.data;
    } catch (error) {
      console.error('Error fetching jurisdictions:', error);
      throw error;
    }
  }

  async getDocumentTypes(): Promise<Array<{
    code: string;
    name: string;
    description: string;
  }>> {
    try {
      const response = await api.get('/api/metadata/document-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  }
}

export const legalApiService = new LegalApiService();

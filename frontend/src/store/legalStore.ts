import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  type: 'case_law' | 'statute' | 'regulation' | 'brief' | 'contract';
  jurisdiction: string;
  date: string;
  citations: string[];
  similarity_score?: number;
}

export interface UploadedDocument {
  document_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  source_documents: any[];
  chat_history: any[];
  tools_used: string[];
  error?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export interface SearchResult {
  documents: LegalDocument[];
  query: string;
  total_results: number;
  search_time: number;
}

export interface CaseAnalysis {
  case_id: string;
  precedents: LegalDocument[];
  conflicts: LegalDocument[];
  key_holdings: string[];
  legal_issues: string[];
  similarity_scores: Record<string, number>;
}

interface LegalResearchState {
  // Search state
  searchQuery: string;
  searchResults: SearchResult | null;
  isSearching: boolean;
  selectedJurisdictions: string[];
  selectedDocumentTypes: string[];
  
  // Document state
  selectedDocument: LegalDocument | null;
  recentDocuments: LegalDocument[];
  bookmarkedDocuments: LegalDocument[];
  
  // Document upload state
  uploadedDocuments: UploadedDocument[];
  isUploading: boolean;
  uploadProgress: number;
  
  // RAG state
  ragQuery: string;
  ragResponse: RAGQueryResponse | null;
  ragHistory: RAGQueryResponse[];
  isQuerying: boolean;
  useConversation: boolean;
  useAgent: boolean;
  
  // Agent tools state
  availableTools: AgentTool[];
  selectedTool: string | null;
  
  // Analysis state
  currentAnalysis: CaseAnalysis | null;
  isAnalyzing: boolean;
  
  // UI state
  sidebarOpen: boolean;
  activeTab: 'search' | 'analysis' | 'drafting' | 'calendar' | 'rag' | 'upload';
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult) => void;
  setIsSearching: (loading: boolean) => void;
  setSelectedJurisdictions: (jurisdictions: string[]) => void;
  setSelectedDocumentTypes: (types: string[]) => void;
  setSelectedDocument: (document: LegalDocument | null) => void;
  addRecentDocument: (document: LegalDocument) => void;
  toggleBookmark: (document: LegalDocument) => void;
  
  // Document upload actions
  setUploadedDocuments: (documents: UploadedDocument[]) => void;
  addUploadedDocument: (document: UploadedDocument) => void;
  setIsUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  
  // RAG actions
  setRagQuery: (query: string) => void;
  setRagResponse: (response: RAGQueryResponse) => void;
  addToRagHistory: (response: RAGQueryResponse) => void;
  setIsQuerying: (querying: boolean) => void;
  setUseConversation: (use: boolean) => void;
  setUseAgent: (use: boolean) => void;
  clearRagHistory: () => void;
  
  // Agent tools actions
  setAvailableTools: (tools: AgentTool[]) => void;
  setSelectedTool: (tool: string | null) => void;
  
  setCurrentAnalysis: (analysis: CaseAnalysis | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: 'search' | 'analysis' | 'drafting' | 'calendar' | 'rag' | 'upload') => void;
}

export const useLegalResearchStore = create<LegalResearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      searchQuery: '',
      searchResults: null,
      isSearching: false,
      selectedJurisdictions: [],
      selectedDocumentTypes: [],
      selectedDocument: null,
      recentDocuments: [],
      bookmarkedDocuments: [],
      
      // Document upload state
      uploadedDocuments: [],
      isUploading: false,
      uploadProgress: 0,
      
      // RAG state
      ragQuery: '',
      ragResponse: null,
      ragHistory: [],
      isQuerying: false,
      useConversation: false,
      useAgent: false,
      
      // Agent tools state
      availableTools: [],
      selectedTool: null,
      
      currentAnalysis: null,
      isAnalyzing: false,
      sidebarOpen: true,
      activeTab: 'search',
      
      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchResults: (results) => set({ searchResults: results }),
      
      setIsSearching: (loading) => set({ isSearching: loading }),
      
      setSelectedJurisdictions: (jurisdictions) => 
        set({ selectedJurisdictions: jurisdictions }),
      
      setSelectedDocumentTypes: (types) => 
        set({ selectedDocumentTypes: types }),
      
      setSelectedDocument: (document) => {
        set({ selectedDocument: document });
        if (document) {
          get().addRecentDocument(document);
        }
      },
      
      addRecentDocument: (document) => {
        const { recentDocuments } = get();
        const exists = recentDocuments.find(doc => doc.id === document.id);
        if (!exists) {
          const newRecent = [document, ...recentDocuments.slice(0, 9)]; // Keep last 10
          set({ recentDocuments: newRecent });
        }
      },
      
      toggleBookmark: (document) => {
        const { bookmarkedDocuments } = get();
        const exists = bookmarkedDocuments.find(doc => doc.id === document.id);
        if (exists) {
          set({ 
            bookmarkedDocuments: bookmarkedDocuments.filter(doc => doc.id !== document.id) 
          });
        } else {
          set({ 
            bookmarkedDocuments: [...bookmarkedDocuments, document] 
          });
        }
      },
      
      // Document upload actions
      setUploadedDocuments: (documents) => set({ uploadedDocuments: documents }),
      
      addUploadedDocument: (document) => {
        const { uploadedDocuments } = get();
        set({ uploadedDocuments: [...uploadedDocuments, document] });
      },
      
      setIsUploading: (uploading) => set({ isUploading: uploading }),
      
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      
      // RAG actions
      setRagQuery: (query) => set({ ragQuery: query }),
      
      setRagResponse: (response) => set({ ragResponse: response }),
      
      addToRagHistory: (response) => {
        const { ragHistory } = get();
        set({ ragHistory: [...ragHistory, response] });
      },
      
      setIsQuerying: (querying) => set({ isQuerying: querying }),
      
      setUseConversation: (use) => set({ useConversation: use }),
      
      setUseAgent: (use) => set({ useAgent: use }),
      
      clearRagHistory: () => set({ ragHistory: [] }),
      
      // Agent tools actions
      setAvailableTools: (tools) => set({ availableTools: tools }),
      
      setSelectedTool: (tool) => set({ selectedTool: tool }),
      
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'legal-research-store',
    }
  )
);

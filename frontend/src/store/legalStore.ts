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
  
  // Analysis state
  currentAnalysis: CaseAnalysis | null;
  isAnalyzing: boolean;
  
  // UI state
  sidebarOpen: boolean;
  activeTab: 'search' | 'analysis' | 'drafting' | 'calendar';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult) => void;
  setIsSearching: (loading: boolean) => void;
  setSelectedJurisdictions: (jurisdictions: string[]) => void;
  setSelectedDocumentTypes: (types: string[]) => void;
  setSelectedDocument: (document: LegalDocument | null) => void;
  addRecentDocument: (document: LegalDocument) => void;
  toggleBookmark: (document: LegalDocument) => void;
  setCurrentAnalysis: (analysis: CaseAnalysis | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: 'search' | 'analysis' | 'drafting' | 'calendar') => void;
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

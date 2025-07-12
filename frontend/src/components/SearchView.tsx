import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLegalResearchStore } from '../store/legalStore';
import { legalApiService } from '../services/legalApi';

const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    selectedJurisdictions,
    setSelectedJurisdictions,
    selectedDocumentTypes,
    setSelectedDocumentTypes,
    setSelectedDocument,
    bookmarkedDocuments,
    toggleBookmark,
  } = useLegalResearchStore();

  const [jurisdictions, setJurisdictions] = useState<Array<{
    code: string;
    name: string;
    type: string;
  }>>([]);
  
  const [documentTypes, setDocumentTypes] = useState<Array<{
    code: string;
    name: string;
  }>>([]);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load metadata on component mount
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [jurisdictionsData, documentTypesData] = await Promise.all([
        legalApiService.getJurisdictions(),
        legalApiService.getDocumentTypes(),
      ]);
      setJurisdictions(jurisdictionsData);
      setDocumentTypes(documentTypesData);
    } catch (error) {
      console.error('Error loading metadata:', error);
      // Set fallback data
      setJurisdictions([
        { code: 'federal', name: 'Federal', type: 'federal' },
        { code: 'ny', name: 'New York', type: 'state' },
        { code: 'ca', name: 'California', type: 'state' },
        { code: 'tx', name: 'Texas', type: 'state' },
      ]);
      setDocumentTypes([
        { code: 'case_law', name: 'Case Law' },
        { code: 'statute', name: 'Statutes' },
        { code: 'regulation', name: 'Regulations' },
        { code: 'brief', name: 'Legal Briefs' },
      ]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await legalApiService.searchDocuments({
        query: searchQuery,
        jurisdictions: selectedJurisdictions,
        document_types: selectedDocumentTypes,
        limit: 50,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // Mock results for demo
      setSearchResults({
        documents: [
          {
            id: '1',
            title: 'Brown v. Board of Education',
            content: 'Landmark Supreme Court case that declared racial segregation in public schools unconstitutional...',
            type: 'case_law',
            jurisdiction: 'federal',
            date: '1954-05-17',
            citations: ['347 U.S. 483'],
            similarity_score: 0.95,
          },
          {
            id: '2',
            title: 'Miranda v. Arizona',
            content: 'Supreme Court case establishing the requirement for police to inform suspects of their rights...',
            type: 'case_law',
            jurisdiction: 'federal',
            date: '1966-06-13',
            citations: ['384 U.S. 436'],
            similarity_score: 0.87,
          },
        ],
        query: searchQuery,
        total_results: 2,
        search_time: 0.234,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const isBookmarked = (documentId: string) => {
    return bookmarkedDocuments.some(doc => doc.id === documentId);
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      case_law: '#1976d2',
      statute: '#388e3c',
      regulation: '#f57c00',
      brief: '#d32f2f',
      contract: '#7b1fa2',
    };
    return colors[type] || '#666';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Legal Research Assistant
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Search through millions of legal documents, cases, and statutes
          </Typography>
        </Paper>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              label="Search legal documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              variant="outlined"
              placeholder="e.g., constitutional law, contract disputes, criminal procedure"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              size="large"
              sx={{ 
                minWidth: 120,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterIcon />}
              size="large"
            >
              Filters
            </Button>
          </Box>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Jurisdictions</InputLabel>
                    <Select
                      multiple
                      value={selectedJurisdictions}
                      onChange={(e) => setSelectedJurisdictions(e.target.value as string[])}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const jurisdiction = jurisdictions.find(j => j.code === value);
                            return (
                              <Chip 
                                key={value} 
                                label={jurisdiction?.name || value} 
                                size="small" 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {jurisdictions.map((jurisdiction) => (
                        <MenuItem key={jurisdiction.code} value={jurisdiction.code}>
                          {jurisdiction.name} ({jurisdiction.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Document Types</InputLabel>
                    <Select
                      multiple
                      value={selectedDocumentTypes}
                      onChange={(e) => setSelectedDocumentTypes(e.target.value as string[])}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const docType = documentTypes.find(d => d.code === value);
                            return (
                              <Chip 
                                key={value} 
                                label={docType?.name || value} 
                                size="small" 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {documentTypes.map((docType) => (
                        <MenuItem key={docType.code} value={docType.code}>
                          {docType.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </Paper>
      </motion.div>

      {/* Search Results */}
      {searchResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Found {searchResults.total_results} results in {searchResults.search_time}s
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {searchResults.documents.map((document, index) => (
              <Grid item xs={12} key={document.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    elevation={1} 
                    sx={{ 
                      '&:hover': { 
                        elevation: 3,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease',
                      } 
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {document.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label={document.type.replace('_', ' ').toUpperCase()}
                              size="small"
                              sx={{ 
                                backgroundColor: getDocumentTypeColor(document.type),
                                color: 'white',
                              }}
                            />
                            <Chip 
                              label={document.jurisdiction.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={document.date}
                              size="small"
                              variant="outlined"
                            />
                            {document.similarity_score && (
                              <Chip 
                                label={`${Math.round(document.similarity_score * 100)}% match`}
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => toggleBookmark(document)}
                          color={isBookmarked(document.id) ? 'primary' : 'default'}
                        >
                          {isBookmarked(document.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {document.content.substring(0, 300)}...
                      </Typography>
                      
                      {document.citations.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Citations:</Typography>
                          {document.citations.map((citation, idx) => (
                            <Chip 
                              key={idx} 
                              label={citation} 
                              size="small" 
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                        onClick={() => setSelectedDocument(document)}
                      >
                        View Full Document
                      </Button>
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download
                      </Button>
                      <Button size="small" startIcon={<ShareIcon />}>
                        Share
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Empty State */}
      {!searchResults && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <SearchIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start your legal research
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your search terms above to find relevant legal documents, cases, and statutes
            </Typography>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default SearchView;

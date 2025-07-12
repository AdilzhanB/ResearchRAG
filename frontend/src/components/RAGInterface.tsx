import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send,
  ExpandMore,
  SmartToy,
  History,
  Clear,
  Settings,
  Psychology,
  Search,
  Article,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLegalResearchStore } from '../store/legalStore';
import { legalApi } from '../services/legalApi';

const RAGInterface: React.FC = () => {
  const {
    ragQuery,
    ragResponse,
    ragHistory,
    isQuerying,
    useConversation,
    useAgent,
    availableTools,
    selectedTool,
    setRagQuery,
    setRagResponse,
    addToRagHistory,
    setIsQuerying,
    setUseConversation,
    setUseAgent,
    setAvailableTools,
    setSelectedTool,
    clearRagHistory,
  } = useLegalResearchStore();

  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ragHistory, ragResponse]);

  useEffect(() => {
    // Load available tools and templates
    loadAgentTools();
    loadWorkflowTemplates();
  }, []);

  const loadAgentTools = async () => {
    try {
      const response = await legalApi.getAvailableTools();
      setAvailableTools(response.tools || []);
    } catch (err) {
      console.error('Failed to load agent tools:', err);
    }
  };

  const loadWorkflowTemplates = async () => {
    try {
      const response = await legalApi.getWorkflowTemplates();
      setWorkflowTemplates(response.templates || []);
    } catch (err) {
      console.error('Failed to load workflow templates:', err);
    }
  };

  const handleQuery = async () => {
    if (!ragQuery.trim()) return;

    setError(null);
    setIsQuerying(true);

    try {
      const response = await legalApi.queryRAG({
        query: ragQuery,
        use_conversation: useConversation,
        use_agent: useAgent,
      });

      setRagResponse(response);
      addToRagHistory(response);
      setRagQuery('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to query documents');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleToolExecution = async (toolName: string) => {
    if (!ragQuery.trim()) return;

    setError(null);
    setIsQuerying(true);

    try {
      const response = await legalApi.executeAgentTool({
        tool_name: toolName,
        query: ragQuery,
      });

      const ragResponse = {
        query: ragQuery,
        answer: response.result,
        source_documents: [],
        chat_history: [],
        tools_used: [toolName],
        error: response.error,
      };

      setRagResponse(ragResponse);
      addToRagHistory(ragResponse);
      setRagQuery('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute tool');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleWorkflowExecution = async (templateName: string) => {
    if (!ragQuery.trim()) return;

    setError(null);
    setIsQuerying(true);

    try {
      const response = await legalApi.executeResearchWorkflow(ragQuery, {
        include_cases: true,
        include_statutes: true,
        include_wikipedia: true,
      });

      const ragResponse = {
        query: ragQuery,
        answer: response.workflow_results.summary || 'Workflow completed',
        source_documents: [],
        chat_history: [],
        tools_used: response.completed_steps || [],
        workflow_results: response.workflow_results,
      };

      setRagResponse(ragResponse);
      addToRagHistory(ragResponse);
      setRagQuery('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute workflow');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleQuery();
    }
  };

  const formatAnswer = (answer: string) => {
    // Simple formatting for better readability
    return answer.split('\n').map((line, index) => (
      <Typography key={index} variant="body2" sx={{ mb: line.trim() ? 1 : 0 }}>
        {line}
      </Typography>
    ));
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          Legal RAG Assistant
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={clearRagHistory}
            disabled={ragHistory.length === 0}
          >
            Clear History
          </Button>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Chat History */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflow: 'auto',
          backgroundColor: 'grey.50',
        }}
      >
        <AnimatePresence>
          {ragHistory.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  {/* Query */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Search sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.query}
                    </Typography>
                  </Box>

                  {/* Answer */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Answer:
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: 'background.paper' }}>
                      {formatAnswer(item.answer)}
                    </Paper>
                  </Box>

                  {/* Tools Used */}
                  {item.tools_used && item.tools_used.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tools Used:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {item.tools_used.map((tool, idx) => (
                          <Chip key={idx} label={tool} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Source Documents */}
                  {item.source_documents && item.source_documents.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">
                          Source Documents ({item.source_documents.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {item.source_documents.map((doc, idx) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={doc.metadata?.title || `Document ${idx + 1}`}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Similarity: {doc.similarity_score?.toFixed(3)}
                                    </Typography>
                                    <Typography variant="body2">
                                      {doc.content?.substring(0, 150)}...
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Error */}
                  {item.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {item.error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {ragHistory.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start a conversation with your legal documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload documents first, then ask questions about legal concepts, cases, or analysis.
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask questions about your legal documents..."
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isQuerying}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleQuery}
            disabled={isQuerying || !ragQuery.trim()}
            startIcon={isQuerying ? <CircularProgress size={16} /> : <Send />}
            sx={{ minWidth: '100px' }}
          >
            {isQuerying ? 'Thinking...' : 'Send'}
          </Button>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleToolExecution('wikipedia_search')}
            disabled={isQuerying || !ragQuery.trim()}
          >
            Wikipedia Search
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleToolExecution('legal_case_search')}
            disabled={isQuerying || !ragQuery.trim()}
          >
            Case Search
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleToolExecution('legal_analysis')}
            disabled={isQuerying || !ragQuery.trim()}
          >
            Legal Analysis
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleWorkflowExecution('basic_research')}
            disabled={isQuerying || !ragQuery.trim()}
          >
            Research Workflow
          </Button>
        </Box>
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>RAG Assistant Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useConversation}
                  onChange={(e) => setUseConversation(e.target.checked)}
                />
              }
              label="Use Conversational Context"
            />
            <Typography variant="caption" display="block" color="text.secondary">
              Maintains context across multiple questions in the conversation
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={useAgent}
                  onChange={(e) => setUseAgent(e.target.checked)}
                />
              }
              label="Use AI Agent Tools"
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" display="block" color="text.secondary">
              Enables access to Wikipedia, legal databases, and other research tools
            </Typography>

            {availableTools.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Tools:
                </Typography>
                <List dense>
                  {availableTools.map((tool, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={tool.name}
                        secondary={tool.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {workflowTemplates.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Workflow Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {workflowTemplates.map((template) => (
                      <MenuItem key={template.name} value={template.name}>
                        {template.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RAGInterface;

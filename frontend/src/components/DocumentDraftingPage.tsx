import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Download,
  Share,
  Edit,
  Copy,
  Clock,
  Check,
  Sparkles,
  BookOpen,
  PenTool,
  Save,
  Eye,
  Zap,
} from 'lucide-react';

const DocumentDraftingPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openNewDocument, setOpenNewDocument] = useState(false);

  const documentTemplates = [
    {
      id: 1,
      name: 'Contract Agreement',
      category: 'Contracts',
      description: 'Standard business contract template with customizable terms',
      icon: '📄',
      usage: 245,
    },
    {
      id: 2,
      name: 'Legal Brief',
      category: 'Litigation',
      description: 'Professional legal brief template for court submissions',
      icon: '📋',
      usage: 189,
    },
    {
      id: 3,
      name: 'Privacy Policy',
      category: 'Compliance',
      description: 'GDPR-compliant privacy policy template',
      icon: '🔒',
      usage: 167,
    },
    {
      id: 4,
      name: 'Terms of Service',
      category: 'Compliance',
      description: 'Comprehensive terms of service agreement',
      icon: '📜',
      usage: 134,
    },
    {
      id: 5,
      name: 'Employment Contract',
      category: 'HR',
      description: 'Standard employment agreement template',
      icon: '👔',
      usage: 98,
    },
    {
      id: 6,
      name: 'NDA Agreement',
      category: 'Contracts',
      description: 'Non-disclosure agreement template',
      icon: '🤐',
      usage: 76,
    },
  ];

  const recentDocuments = [
    {
      id: 1,
      title: 'Service Agreement - TechCorp',
      status: 'Draft',
      lastModified: '2 hours ago',
      progress: 75,
      collaborators: 3,
    },
    {
      id: 2,
      title: 'Employment Contract - John Doe',
      status: 'Review',
      lastModified: '1 day ago',
      progress: 90,
      collaborators: 2,
    },
    {
      id: 3,
      title: 'Privacy Policy Update',
      status: 'Final',
      lastModified: '3 days ago',
      progress: 100,
      collaborators: 1,
    },
  ];

  const aiFeatures = [
    {
      icon: Sparkles,
      title: 'AI Content Generation',
      description: 'Generate legal content with AI assistance',
      color: '#6366f1',
    },
    {
      icon: BookOpen,
      title: 'Clause Library',
      description: 'Access to pre-approved legal clauses',
      color: '#10b981',
    },
    {
      icon: Zap,
      title: 'Smart Suggestions',
      description: 'Intelligent document improvement suggestions',
      color: '#f59e0b',
    },
    {
      icon: Check,
      title: 'Compliance Check',
      description: 'Automated compliance and error checking',
      color: '#8b5cf6',
    },
  ];

  const documentCategories = [
    'All Categories',
    'Contracts',
    'Litigation',
    'Compliance',
    'HR',
    'IP',
    'Real Estate',
    'Corporate',
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Document Drafting Studio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            AI-powered legal document creation and collaboration
          </Typography>

          {/* Search and Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search templates, documents, or clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 500 }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => setOpenNewDocument(true)}
              sx={{
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                minWidth: 180,
              }}
            >
              New Document
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* AI Features */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              AI-Powered Features
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {aiFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${feature.color}20`,
                            color: feature.color,
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <feature.icon size={20} />
                        </Avatar>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>

        {/* Document Templates */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Document Templates
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    {documentCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Grid container spacing={2}>
                  {documentTemplates.map((template) => (
                    <Grid item xs={12} sm={6} key={template.id}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#6366f1',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                            {template.icon}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {template.name}
                            </Typography>
                            <Chip
                              label={template.category}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Used {template.usage} times
                          </Typography>
                          <Button size="small" variant="outlined">
                            Use Template
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Documents & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Documents
                </Typography>
                <List>
                  {recentDocuments.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32 }}>
                            <FileText size={16} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {doc.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip
                                  label={doc.status}
                                  size="small"
                                  color={
                                    doc.status === 'Final'
                                      ? 'success'
                                      : doc.status === 'Review'
                                      ? 'warning'
                                      : 'default'
                                  }
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {doc.collaborators} collaborators
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {doc.lastModified}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={doc.progress}
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <IconButton size="small">
                            <Edit size={16} />
                          </IconButton>
                          <IconButton size="small">
                            <Share size={16} />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < recentDocuments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PenTool size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Start Blank Document
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Copy size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Duplicate Document
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Eye size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Preview Mode
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Export Documents
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* New Document Dialog */}
      <Dialog open={openNewDocument} onClose={() => setOpenNewDocument(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how you'd like to start your new document
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: '#6366f1',
                  },
                }}
              >
                <FileText size={32} color="#6366f1" />
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                  From Template
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with a pre-built template
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: '#6366f1',
                  },
                }}
              >
                <PenTool size={32} color="#6366f1" />
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                  Blank Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with a blank document
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDocument(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenNewDocument(false)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDraftingPage;

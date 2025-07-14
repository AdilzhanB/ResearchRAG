import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Scale,
  FileText,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
  Star,
  Plus,
  Filter,
  Download,
  Share,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-analysis-tabpanel-${index}`}
      aria-labelledby={`case-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CaseAnalysisPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const recentAnalyses = [
    {
      id: 1,
      title: 'Contract Dispute Analysis',
      caseNumber: 'CV-2024-001',
      status: 'In Progress',
      completion: 75,
      lastUpdated: '2 hours ago',
      priority: 'High',
    },
    {
      id: 2,
      title: 'IP Infringement Case',
      caseNumber: 'IP-2024-007',
      status: 'Completed',
      completion: 100,
      lastUpdated: '1 day ago',
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Employment Law Review',
      caseNumber: 'EL-2024-012',
      status: 'Pending Review',
      completion: 60,
      lastUpdated: '3 days ago',
      priority: 'Low',
    },
  ];

  const analysisMetrics = [
    { label: 'Cases Analyzed', value: '247', icon: Scale, color: '#6366f1' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: '#10b981' },
    { label: 'Avg. Time Saved', value: '15h', icon: Clock, color: '#f59e0b' },
    { label: 'Documents Processed', value: '1,203', icon: FileText, color: '#8b5cf6' },
  ];

  const caseCategories = [
    'Contract Law',
    'Criminal Defense',
    'Family Law',
    'Personal Injury',
    'Corporate Law',
    'IP Law',
    'Employment Law',
    'Real Estate',
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
            Case Analysis Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            AI-powered legal case analysis and insights
          </Typography>

          {/* Search and Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search cases, documents, or legal topics..."
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
              sx={{
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                minWidth: 150,
              }}
            >
              New Analysis
            </Button>
            <IconButton>
              <Filter size={20} />
            </IconButton>
          </Box>
        </Box>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {analysisMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: '100%',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${metric.color}20`,
                        color: metric.color,
                        mr: 2,
                      }}
                    >
                      <metric.icon size={24} />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab
              icon={<BarChart3 size={20} />}
              label="Analysis Overview"
              iconPosition="start"
            />
            <Tab
              icon={<PieChart size={20} />}
              label="Case Insights"
              iconPosition="start"
            />
            <Tab
              icon={<Activity size={20} />}
              label="Performance"
              iconPosition="start"
            />
            <Tab
              icon={<FileText size={20} />}
              label="Reports"
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tabValue}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Recent Analysis */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recent Case Analyses
                      </Typography>
                      <Button variant="outlined" size="small">
                        View All
                      </Button>
                    </Box>
                    <List>
                      {recentAnalyses.map((analysis, index) => (
                        <React.Fragment key={analysis.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#6366f1' }}>
                                <Scale size={20} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {analysis.title}
                                  </Typography>
                                  <Chip
                                    label={analysis.priority}
                                    size="small"
                                    color={
                                      analysis.priority === 'High'
                                        ? 'error'
                                        : analysis.priority === 'Medium'
                                        ? 'warning'
                                        : 'default'
                                    }
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.caseNumber} • {analysis.lastUpdated}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={analysis.completion}
                                      sx={{ flexGrow: 1, mr: 1 }}
                                    />
                                    <Typography variant="caption">
                                      {analysis.completion}%
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small">
                                <Share size={16} />
                              </IconButton>
                              <IconButton size="small">
                                <Download size={16} />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < recentAnalyses.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions & Categories */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Scale size={20} />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Case Comparison
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BookOpen size={20} />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Legal Research
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Users size={20} />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Team Collaboration
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Case Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {caseCategories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          variant="outlined"
                          size="small"
                          clickable
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Case Insights Dashboard
            </Typography>
            <Typography color="text.secondary">
              Advanced case insights and analytics will be displayed here.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Performance Analytics
            </Typography>
            <Typography color="text.secondary">
              Performance metrics and analytics will be displayed here.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Analysis Reports
            </Typography>
            <Typography color="text.secondary">
              Generated reports and export options will be displayed here.
            </Typography>
          </TabPanel>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CaseAnalysisPage;

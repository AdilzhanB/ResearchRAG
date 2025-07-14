import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  Clock,
  TrendingUp,
  Users,
  Scale,
  BookOpen,
  Calendar,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Legal Research',
      value: '2,847',
      change: '+12%',
      icon: Search,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      title: 'Documents Analyzed',
      value: '1,239',
      change: '+8%',
      icon: FileText,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    },
    {
      title: 'Cases Found',
      value: '486',
      change: '+24%',
      icon: Scale,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981, #059669)',
    },
    {
      title: 'Time Saved',
      value: '156h',
      change: '+18%',
      icon: Clock,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Contract Analysis Completed',
      document: 'NDA_Agreement_2024.pdf',
      time: '2 hours ago',
      type: 'analysis',
      status: 'completed',
    },
    {
      id: 2,
      action: 'Legal Research Query',
      document: 'Employment Law Cases',
      time: '4 hours ago',
      type: 'search',
      status: 'in-progress',
    },
    {
      id: 3,
      action: 'Document Upload',
      document: 'Corporate_Bylaws_Draft.docx',
      time: '6 hours ago',
      type: 'upload',
      status: 'completed',
    },
    {
      id: 4,
      action: 'Citation Generated',
      document: 'Intellectual Property Brief',
      time: '1 day ago',
      type: 'citation',
      status: 'completed',
    },
  ];

  const quickActions = [
    {
      title: 'Start New Research',
      description: 'Begin a new legal research session',
      icon: Search,
      color: '#6366f1',
      action: 'research',
    },
    {
      title: 'Upload Documents',
      description: 'Add new documents for analysis',
      icon: FileText,
      color: '#06b6d4',
      action: 'upload',
    },
    {
      title: 'AI Legal Assistant',
      description: 'Get instant legal insights',
      icon: Zap,
      color: '#8b5cf6',
      action: 'assistant',
    },
    {
      title: 'Schedule Review',
      description: 'Set up document review session',
      icon: Calendar,
      color: '#10b981',
      action: 'schedule',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Legal Research Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back! Here's your legal research overview and recent activity.
          </Typography>
        </motion.div>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card
                sx={{
                  background: stat.bgGradient,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 20px 40px ${alpha(stat.color, 0.3)}`,
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <stat.icon size={28} />
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                </CardContent>
                
                {/* Decorative circles */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(145deg, 
                  ${alpha(theme.palette.background.paper, 0.95)}, 
                  ${alpha(theme.palette.background.paper, 0.8)})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={action.title}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: `1px solid ${alpha(action.color, 0.1)}`,
                          background: `linear-gradient(135deg, ${alpha(action.color, 0.05)}, ${alpha(action.color, 0.02)})`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            border: `1px solid ${alpha(action.color, 0.3)}`,
                            boxShadow: `0 8px 25px ${alpha(action.color, 0.15)}`,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              background: action.color,
                              width: 48,
                              height: 48,
                            }}
                          >
                            <action.icon size={24} />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {action.description}
                            </Typography>
                          </Box>
                          <ArrowUpRight size={20} color={action.color} />
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(145deg, 
                  ${alpha(theme.palette.background.paper, 0.95)}, 
                  ${alpha(theme.palette.background.paper, 0.8)})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                height: 'fit-content',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.background.default, 0.5),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.05),
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Activity size={16} color={theme.palette.primary.main} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {activity.action}
                        </Typography>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={activity.status === 'completed' ? 'success' : 'warning'}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        {activity.document}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View All Activity
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* AI Insights Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.05)}, 
                  ${alpha(theme.palette.secondary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    width: 56,
                    height: 56,
                  }}
                >
                  <Target size={28} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    AI Legal Insights
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Powered by advanced machine learning and legal expertise
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                      98.7%
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Accuracy Rate
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Our AI maintains exceptional accuracy in legal document analysis
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={700} color="secondary.main" gutterBottom>
                      15min
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Average Analysis
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rapid processing of complex legal documents and cases
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={700} color="success.main" gutterBottom>
                      50k+
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Legal Precedents
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Comprehensive database of legal cases and precedents
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  Fade,
  Slide,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Scale, UserPlus, LogIn } from 'lucide-react';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  username?: string;
}

interface EnhancedAuthPageProps {
  onAuthenticate?: () => void;
}

const EnhancedAuthPage: React.FC<EnhancedAuthPageProps> = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return;
      }
      
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always succeed
      if (onAuthenticate) {
        onAuthenticate();
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (onAuthenticate) {
      onAuthenticate();
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      username: '',
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
          filter: 'blur(30px)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper
            elevation={20}
            sx={{
              p: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  <Scale size={40} />
                </Avatar>
              </motion.div>
              
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                LegalRAG Pro
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-Powered Legal Research Assistant
              </Typography>
            </Box>

            {/* Mode Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                variant={isLogin ? 'contained' : 'outlined'}
                onClick={() => setIsLogin(true)}
                startIcon={<LogIn size={20} />}
                sx={{ mr: 1, borderRadius: 3 }}
              >
                Sign In
              </Button>
              <Button
                variant={!isLogin ? 'contained' : 'outlined'}
                onClick={() => setIsLogin(false)}
                startIcon={<UserPlus size={20} />}
                sx={{ borderRadius: 3 }}
              >
                Sign Up
              </Button>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Auth Form */}
            <Slide direction="up" in mountOnEnter unmountOnExit>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  {!isLogin && (
                    <>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                        required={!isLogin}
                      />
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                        required={!isLogin}
                      />
                    </>
                  )}
                  
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    required
                  />
                  
                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                      required={!isLogin}
                    />
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                    mb: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Try Demo Login'
                  )}
                </Button>
              </form>
            </Slide>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="text"
                  onClick={toggleMode}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Button>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default EnhancedAuthPage;

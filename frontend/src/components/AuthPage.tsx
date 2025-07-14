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

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
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
    
    // TODO: Implement actual authentication
    setTimeout(() => {
      setLoading(false);
      console.log('Auth submitted:', formData);
    }, 2000);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
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
          bottom: '10%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
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
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(145deg, 
                ${alpha(theme.palette.background.paper, 0.95)}, 
                ${alpha(theme.palette.background.paper, 0.8)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <Scale size={40} />
                </Avatar>
              </motion.div>
              
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LegalRAG Pro
              </Typography>
              
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 3 }}
              >
                {isLogin 
                  ? 'Welcome back to the future of legal research' 
                  : 'Join the next generation of legal professionals'
                }
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Slide direction="left" in={true} mountOnEnter unmountOnExit>
                <Box>
                  {!isLogin && (
                    <Fade in={!isLogin}>
                      <Box>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          margin="normal"
                          required={!isLogin}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          margin="normal"
                          required={!isLogin}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                              },
                            },
                          }}
                        />
                      </Box>
                    </Fade>
                  )}
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      },
                    }}
                  />
                  
                  {!isLogin && (
                    <Fade in={!isLogin}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        margin="normal"
                        required={!isLogin}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                          },
                        }}
                      />
                    </Fade>
                  )}
                </Box>
              </Slide>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={isLogin ? <LogIn /> : <UserPlus />}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: theme.palette.grey[300],
                    },
                  }}
                >
                  {loading 
                    ? 'Processing...' 
                    : isLogin 
                      ? 'Sign In' 
                      : 'Create Account'
                  }
                </Button>
              </motion.div>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={toggleMode}
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      background: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AuthPage;

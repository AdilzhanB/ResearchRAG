import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  alpha,
  Paper,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FileText,
  Calendar,
  BookOpen,
  Settings,
  Bell,
  User,
  LogOut,
  Menu as MenuIcon,
  Home,
  Scale,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: '#6366f1' },
    { id: 'search', label: 'Legal Search', icon: Search, color: '#06b6d4' },
    { id: 'documents', label: 'Documents', icon: FileText, color: '#10b981' },
    { id: 'cases', label: 'Case Law', icon: Scale, color: '#f59e0b' },
    { id: 'research', label: 'Research', icon: BookOpen, color: '#8b5cf6' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: '#ef4444' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: '#14b8a6' },
    { id: 'practice', label: 'Practice Areas', icon: Briefcase, color: '#f97316' },
  ];

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.default, 0.98)} 100%)`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 1,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Scale size={30} />
          </Avatar>
        </motion.div>
        <Typography variant="h6" fontWeight={700}>
          LegalRAG Pro
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          AI-Powered Legal Research
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${alpha(item.color, 0.1)}, ${alpha(item.color, 0.05)})`,
                    border: `1px solid ${alpha(item.color, 0.2)}`,
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '& .MuiListItemText-primary': {
                      color: item.color,
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(item.color, 0.05)}, ${alpha(item.color, 0.02)})`,
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: activeTab === item.id ? item.color : theme.palette.text.secondary,
                  }}
                >
                  <item.icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Settings */}
      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              py: 1.5,
              '&:hover': {
                background: alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: `linear-gradient(90deg, 
            ${alpha(theme.palette.background.paper, 0.95)}, 
            ${alpha(theme.palette.background.paper, 0.90)})`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Bell size={20} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  <User size={16} />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1,
            borderRadius: 2,
            background: `linear-gradient(145deg, 
              ${alpha(theme.palette.background.paper, 0.95)}, 
              ${alpha(theme.palette.background.paper, 0.8)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <User size={16} style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings size={16} style={{ marginRight: 8 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              background: 'transparent',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 0.5)} 0%, 
            ${alpha(theme.palette.background.paper, 0.3)} 100%)`,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

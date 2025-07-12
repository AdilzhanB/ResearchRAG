import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Gavel as GavelIcon,
  BookmarkBorder as BookmarkIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Notifications,
  CloudUpload as UploadIcon,
  Psychology as RAGIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLegalResearchStore } from '../store/legalStore';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
  } = useLegalResearchStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { id: 'search', label: 'Search & Research', icon: <SearchIcon />, color: '#1976d2' },
    { id: 'upload', label: 'Document Upload', icon: <UploadIcon />, color: '#7c4dff' },
    { id: 'rag', label: 'RAG Assistant', icon: <RAGIcon />, color: '#00acc1' },
    { id: 'analysis', label: 'Case Analysis', icon: <AnalyticsIcon />, color: '#388e3c' },
    { id: 'drafting', label: 'Document Drafting', icon: <EditIcon />, color: '#f57c00' },
    { id: 'calendar', label: 'Calendar & Deadlines', icon: <CalendarIcon />, color: '#d32f2f' },
  ];

  const secondaryItems = [
    { id: 'bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
    { id: 'history', label: 'Recent Documents', icon: <HistoryIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <GavelIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            LegalMind Research
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Avatar sx={{ mr: 2, width: 24, height: 24 }}>JD</Avatar>
          John Doe, Esq.
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>Profile Settings</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>

      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e7ff',
            background: '#fafbff',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          {/* Primary Navigation */}
          <Typography variant="overline" sx={{ px: 2, color: '#64748b', fontWeight: 600 }}>
            Main Features
          </Typography>
          <List sx={{ mt: 1 }}>
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListItem
                  button
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                      '& .MuiListItemIcon-root': {
                        color: item.color,
                      },
                    },
                    '&:hover': {
                      backgroundColor: `${item.color}08`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: activeTab === item.id ? 600 : 400 }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Secondary Navigation */}
          <Typography variant="overline" sx={{ px: 2, color: '#64748b', fontWeight: 600 }}>
            Library
          </Typography>
          <List sx={{ mt: 1 }}>
            {secondaryItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListItem
                  button
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: '#e2e8f0',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s ease',
          marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: 'calc(100vh - 64px)' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Layout;

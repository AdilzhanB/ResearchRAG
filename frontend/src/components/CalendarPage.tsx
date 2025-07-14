import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Bell,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  Video,
  Phone,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Settings,
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [openNewEvent, setOpenNewEvent] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Contract Review Deadline',
      case: 'TechCorp vs. CompetitorX',
      date: '2024-02-15',
      time: '17:00',
      priority: 'High',
      type: 'deadline',
      daysLeft: 3,
    },
    {
      id: 2,
      title: 'Court Hearing',
      case: 'Estate Planning - Johnson',
      date: '2024-02-18',
      time: '09:30',
      priority: 'Critical',
      type: 'hearing',
      daysLeft: 6,
    },
    {
      id: 3,
      title: 'Client Meeting',
      case: 'IP Consultation - StartupABC',
      date: '2024-02-20',
      time: '14:00',
      priority: 'Medium',
      type: 'meeting',
      daysLeft: 8,
    },
    {
      id: 4,
      title: 'Document Filing',
      case: 'Employment Dispute - Smith',
      date: '2024-02-22',
      time: '16:00',
      priority: 'High',
      type: 'filing',
      daysLeft: 10,
    },
  ];

  const todayEvents = [
    {
      id: 1,
      title: 'Team Standup',
      time: '09:00',
      type: 'meeting',
      location: 'Conference Room A',
      attendees: 5,
    },
    {
      id: 2,
      title: 'Client Consultation',
      time: '11:30',
      type: 'consultation',
      location: 'Virtual',
      attendees: 2,
    },
    {
      id: 3,
      title: 'Contract Review',
      time: '14:00',
      type: 'task',
      location: 'Office',
      attendees: 1,
    },
    {
      id: 4,
      title: 'Strategy Meeting',
      time: '16:30',
      type: 'meeting',
      location: 'Conference Room B',
      attendees: 8,
    },
  ];

  const calendarStats = [
    { label: 'Upcoming Deadlines', value: '12', icon: AlertTriangle, color: '#f59e0b' },
    { label: 'Today\'s Events', value: '4', icon: Calendar, color: '#6366f1' },
    { label: 'This Week', value: '23', icon: Clock, color: '#10b981' },
    { label: 'Overdue Items', value: '2', icon: AlertTriangle, color: '#ef4444' },
  ];

  const eventTypes = [
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'deadline', label: 'Deadline', icon: AlertTriangle },
    { value: 'hearing', label: 'Court Hearing', icon: Calendar },
    { value: 'consultation', label: 'Client Consultation', icon: Users },
    { value: 'filing', label: 'Document Filing', icon: CheckCircle },
    { value: 'task', label: 'Task', icon: CheckCircle },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '#ef4444';
      case 'High':
        return '#f59e0b';
      case 'Medium':
        return '#10b981';
      case 'Low':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return AlertTriangle;
      case 'hearing':
        return Calendar;
      case 'meeting':
        return Users;
      case 'consultation':
        return Video;
      case 'filing':
        return CheckCircle;
      default:
        return Clock;
    }
  };

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
            Calendar & Deadlines
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage your legal calendar, deadlines, and appointments
          </Typography>

          {/* Search and Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search events, deadlines, or cases..."
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
              onClick={() => setOpenNewEvent(true)}
              sx={{
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                minWidth: 150,
              }}
            >
              New Event
            </Button>
            <IconButton>
              <Filter size={20} />
            </IconButton>
            <IconButton>
              <Settings size={20} />
            </IconButton>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {calendarStats.map((stat, index) => (
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
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        mr: 2,
                      }}
                    >
                      <stat.icon size={24} />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    February 2024
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <ChevronLeft size={20} />
                    </IconButton>
                    <IconButton size="small">
                      <ChevronRight size={20} />
                    </IconButton>
                    <Button variant="outlined" size="small">
                      Today
                    </Button>
                  </Box>
                </Box>

                {/* Calendar Grid Placeholder */}
                <Box
                  sx={{
                    height: 400,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #cbd5e1',
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Calendar size={48} color="#64748b" />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      Interactive Calendar View
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Full calendar component will be integrated here
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Deadlines
                  </Typography>
                  <Button variant="outlined" size="small">
                    View All
                  </Button>
                </Box>
                <List>
                  {upcomingDeadlines.map((deadline, index) => {
                    const TypeIcon = getTypeIcon(deadline.type);
                    return (
                      <React.Fragment key={deadline.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: getPriorityColor(deadline.priority) + '20', color: getPriorityColor(deadline.priority) }}>
                              <TypeIcon size={20} />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {deadline.title}
                                </Typography>
                                <Chip
                                  label={deadline.priority}
                                  size="small"
                                  sx={{
                                    bgcolor: getPriorityColor(deadline.priority) + '20',
                                    color: getPriorityColor(deadline.priority),
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {deadline.case}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {deadline.date} at {deadline.time} • {deadline.daysLeft} days left
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                              <Bell size={16} />
                            </IconButton>
                            <IconButton size="small">
                              <Download size={16} />
                            </IconButton>
                          </Box>
                        </ListItem>
                        {index < upcomingDeadlines.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Today's Schedule & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Today's Schedule
                </Typography>
                <List>
                  {todayEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32 }}>
                            <Clock size={16} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {event.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {event.time}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <MapPin size={12} />
                                <Typography variant="caption" color="text.secondary">
                                  {event.location}
                                </Typography>
                                <Users size={12} />
                                <Typography variant="caption" color="text.secondary">
                                  {event.attendees}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < todayEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Plus size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Schedule Meeting
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AlertTriangle size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Set Deadline
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Bell size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Create Reminder
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Video size={20} />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Video Conference
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Notification Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Reminders"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Desktop Notifications"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="SMS Alerts"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Calendar Sync"
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* New Event Dialog */}
      <Dialog open={openNewEvent} onClose={() => setOpenNewEvent(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Event Title"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Event Type</InputLabel>
              <Select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                {eventTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon size={16} />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Location"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value="">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewEvent(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenNewEvent(false)}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;

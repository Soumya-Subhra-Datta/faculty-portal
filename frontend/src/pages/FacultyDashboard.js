import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facultyData, setFacultyData] = useState(null);
  const [myDuties, setMyDuties] = useState([]);
  const [mySubstitutions, setMySubstitutions] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // For demo, using faculty ID 1 - in real app would come from auth
      const facultyId = 1;
      
      const [dutiesRes, subsRes, timetableRes] = await Promise.all([
        api.get(`/duties?faculty_id=${facultyId}`),
        api.get(`/substitutions?faculty_id=${facultyId}`),
        api.get(`/timetable?faculty_id=${facultyId}`)
      ]);

      setMyDuties(dutiesRes.data);
      setMySubstitutions(subsRes.data);
      setMyTimetable(timetableRes.data);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              🎓 Faculty Portal - My Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Typography variant="body2">{user?.name || 'Faculty'}</Typography>
              <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 360, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <Button size="small" onClick={markAllAsRead}>Mark all read</Button>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={() => markAsRead(notification.id)}
              sx={{ bgcolor: notification.is_read ? 'transparent' : 'action.hover' }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Message */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Faculty Portal!
          </Typography>
          <Typography variant="body1">
            View your schedule, duties, and substitute classes here. You'll receive real-time notifications when changes occur.
          </Typography>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                  <Box>
                    <Typography variant="h4">{myDuties.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Assigned Duties</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: '#388e3c' }} />
                  <Box>
                    <Typography variant="h4">{mySubstitutions.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Substitute Classes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#fce4ec' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <NotificationsIcon sx={{ fontSize: 40, color: '#c2185b' }} />
                  <Box>
                    <Typography variant="h4">{unreadCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Unread Notifications</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* My Duties */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              📋 My Duties
            </Typography>
            <Button 
              component={Link}
              to="/faculty/timetable"
              endIcon={<ArrowForwardIcon />}
            >
              View Timetable
            </Button>
          </Box>
          {myDuties.length === 0 ? (
            <Alert severity="info">No duties assigned</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myDuties.slice(0, 5).map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.duty_date}</TableCell>
                      <TableCell>
                        <Chip label={duty.duty_type} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{duty.start_time} - {duty.end_time}</TableCell>
                      <TableCell>{duty.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={duty.status} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* My Substitutions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔄 My Substitute Classes
          </Typography>
          {mySubstitutions.length === 0 ? (
            <Alert severity="success">No substitute classes assigned</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Original Faculty</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mySubstitutions.slice(0, 5).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.substitution_date}</TableCell>
                      <TableCell>{sub.original_faculty_name}</TableCell>
                      <TableCell>{sub.subject}</TableCell>
                      <TableCell>{sub.start_time} - {sub.end_time}</TableCell>
                      <TableCell>{sub.room || 'TBA'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sub.status} 
                          color={sub.status === 'confirmed' ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default FacultyDashboard;

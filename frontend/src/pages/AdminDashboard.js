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
  Badge,
  Menu,
  MenuItem,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayDuties, setTodayDuties] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [dutiesRes, subsRes, facultyRes] = await Promise.all([
        api.get(`/duties/today/all`),
        api.get(`/substitutions?date=${today}`),
        api.get('/faculty')
      ]);

      setTodayDuties(dutiesRes.data);
      setSubstitutions(subsRes.data);
      setFaculty(facultyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getNotificationColor = (type) => {
    switch (type) {
      case 'duty': return 'error';
      case 'substitution': return 'warning';
      case 'alert': return 'error';
      default: return 'info';
    }
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
              🎓 Faculty Portal - Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Typography variant="body2">{user?.name}</Typography>
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
        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Box>
                    <Typography variant="h4">{todayDuties.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Today's Duties</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                  <Box>
                    <Typography variant="h4">{substitutions.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Today's Substitutions</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#388e3c' }} />
                  <Box>
                    <Typography variant="h4">{faculty.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Faculty</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fce4ec' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#c2185b' }} />
                  <Box>
                    <Typography variant="h4">
                      {substitutions.filter(s => s.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Pending Substitutions</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<AddIcon />}
              component={Link}
              to="/admin/assign-duty"
            >
              Assign Duty
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<ViewListIcon />}
              component={Link}
              to="/admin/timetable"
            >
              View Timetable
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<ScheduleIcon />}
              component={Link}
              to="/admin/substitutions"
            >
              View Substitutions
            </Button>
          </Grid>
        </Grid>

        {/* Today's Duties */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            📋 Today's Duties
          </Typography>
          {todayDuties.length === 0 ? (
            <Alert severity="info">No duties assigned for today</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Faculty</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Duty Type</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayDuties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.faculty_name}</TableCell>
                      <TableCell>{duty.department}</TableCell>
                      <TableCell>
                        <Chip 
                          label={duty.duty_type} 
                          color={duty.duty_type === 'exam' ? 'error' : 'primary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {duty.start_time} - {duty.end_time}
                      </TableCell>
                      <TableCell>{duty.location || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Today's Substitutions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔄 Today's Substitutions
          </Typography>
          {substitutions.length === 0 ? (
            <Alert severity="success">No substitutions needed for today</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Original Faculty</TableCell>
                    <TableCell>Substitute</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {substitutions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.original_faculty_name}</TableCell>
                      <TableCell>{sub.substitute_faculty_name}</TableCell>
                      <TableCell>{sub.subject}</TableCell>
                      <TableCell>{sub.start_time} - {sub.end_time}</TableCell>
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

export default AdminDashboard;

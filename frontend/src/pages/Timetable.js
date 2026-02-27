import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const Timetable = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    day: '',
    faculty_id: ''
  });
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    fetchFaculty();
    fetchTimetable();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [filters]);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.day) params.append('day', filters.day);
      if (filters.faculty_id) params.append('faculty_id', filters.faculty_id);
      
      const response = await api.get(`/timetable?${params.toString()}`);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'error';
      case 'pending': return 'warning';
      case 'normal': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link}
              to={isAdmin ? '/admin' : '/faculty'}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📅 Timetable
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  name="day"
                  value={filters.day}
                  onChange={handleFilterChange}
                  label="Day of Week"
                >
                  <MenuItem value="">All Days</MenuItem>
                  {days.map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Faculty</InputLabel>
                <Select
                  name="faculty_id"
                  value={filters.faculty_id}
                  onChange={handleFilterChange}
                  label="Faculty"
                >
                  <MenuItem value="">All Faculty</MenuItem>
                  {faculty.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Timetable Grid */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Class Schedule
          </Typography>
          
          {loading ? (
            <Typography>Loading...</Typography>
          ) : timetable.length === 0 ? (
            <Alert severity="info">No timetable entries found</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Day</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Faculty</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Year/Section</strong></TableCell>
                    <TableCell><strong>Room</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timetable.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{entry.day_of_week}</TableCell>
                      <TableCell>
                        {entry.start_time?.substring(0, 5)} - {entry.end_time?.substring(0, 5)}
                      </TableCell>
                      <TableCell>{entry.faculty_name}</TableCell>
                      <TableCell>{entry.subject}</TableCell>
                      <TableCell>{entry.year} {entry.section}</TableCell>
                      <TableCell>{entry.room || 'TBA'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.substitution_status || 'Normal'} 
                          color={getStatusColor(entry.substitution_status)}
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

export default Timetable;

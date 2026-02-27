import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const AssignDuty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    faculty_id: '',
    duty_type: '',
    duty_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/duties', formData);
      setSuccess('Duty assigned successfully! Substitutes have been automatically assigned.');
      
      // Reset form
      setFormData({
        faculty_id: '',
        duty_type: '',
        duty_date: '',
        start_time: '',
        end_time: '',
        location: '',
        description: ''
      });

      // Show automation results
      if (response.data.automation) {
        console.log('Automation results:', response.data.automation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign duty');
    } finally {
      setLoading(false);
    }
  };

  const dutyTypes = [
    { value: 'exam', label: 'Examination' },
    { value: 'placement', label: 'Placement Drive' },
    { value: 'invigilation', label: 'Invigilation' },
    { value: 'event', label: 'Event/Conference' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link}
              to="/admin"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Assign Duty
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            📝 Assign New Duty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in the details below. The system will automatically find substitutes for affected classes.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Faculty Member</InputLabel>
                  <Select
                    name="faculty_id"
                    value={formData.faculty_id}
                    onChange={handleChange}
                    label="Faculty Member"
                  >
                    {faculty.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.name} - {f.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Duty Type</InputLabel>
                  <Select
                    name="duty_type"
                    value={formData.duty_type}
                    onChange={handleChange}
                    label="Duty Type"
                  >
                    {dutyTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  name="duty_date"
                  value={formData.duty_date}
                  onChange={handleChange}
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  label="Start Time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  label="End Time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  label="Location"
                  placeholder="e.g., Exam Hall A"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  label="Description (Optional)"
                  placeholder="Additional details about the duty..."
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign Duty'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/admin"
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Info Box */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            ℹ️ How it works
          </Typography>
          <Typography variant="body2">
            When you assign a duty, the system will automatically:
          </Typography>
          <ul>
            <li>Mark the faculty member as unavailable</li>
            <li>Find all affected classes in their timetable</li>
            <li>Identify eligible substitutes (available, no conflicts)</li>
            <li>Use AI to rank candidates based on department, workload, and fairness</li>
            <li>Automatically assign the best substitute</li>
            <li>Send notifications to all affected faculty</li>
          </ul>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssignDuty;

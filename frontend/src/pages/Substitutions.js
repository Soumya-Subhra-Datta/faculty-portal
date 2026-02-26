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
  Button,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const Substitutions = () => {
  const location = useLocation();
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubstitutions();
  }, [filter]);

  const fetchSubstitutions = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/substitutions${params}`);
      setSubstitutions(response.data);
    } catch (error) {
      console.error('Error fetching substitutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
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
              to="/admin"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              🔄 Substitutions
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Substitutions Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Substitutions
          </Typography>
          
          {loading ? (
            <Typography>Loading...</Typography>
          ) : substitutions.length === 0 ? (
            <Alert severity="info">No substitutions found</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Original Faculty</strong></TableCell>
                    <TableCell><strong>Substitute</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Year/Section</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Room</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>AI Selected</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {substitutions.map((sub) => (
                    <TableRow key={sub.id} hover>
                      <TableCell>{sub.substitution_date}</TableCell>
                      <TableCell>{sub.original_faculty_name}</TableCell>
                      <TableCell>{sub.substitute_faculty_name}</TableCell>
                      <TableCell>{sub.subject}</TableCell>
                      <TableCell>{sub.year} {sub.section}</TableCell>
                      <TableCell>
                        {sub.start_time?.substring(0, 5)} - {sub.end_time?.substring(0, 5)}
                      </TableCell>
                      <TableCell>{sub.room || 'TBA'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sub.status} 
                          color={getStatusColor(sub.status)}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={sub.ai_selected ? 'AI' : 'Manual'} 
                          color={sub.ai_selected ? 'primary' : 'secondary'}
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

export default Substitutions;

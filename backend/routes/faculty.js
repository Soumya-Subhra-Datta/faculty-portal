/**
 * Faculty Routes
 * Handles faculty management
 */

const express = require('express');
const router = express.Router();
const { getMultipleRows, getSingleRow, executeQuery } = require('../db');

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const faculty = await getMultipleRows('SELECT * FROM faculty ORDER BY name');
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Error fetching faculty' });
  }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const faculty = await getSingleRow('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Error fetching faculty' });
  }
});

// Create new faculty
router.post('/', async (req, res) => {
  try {
    const { name, email, department, designation, phone, workload_hours } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ message: 'Name, email, and department are required' });
    }

    const result = await executeQuery(
      'INSERT INTO faculty (name, email, department, designation, phone, workload_hours) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, department, designation || null, phone || null, workload_hours || 0]
    );

    const newFaculty = await getSingleRow('SELECT * FROM faculty WHERE id = ?', [result.insertId]);
    res.status(201).json(newFaculty);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Error creating faculty:', error);
    res.status(500).json({ message: 'Error creating faculty' });
  }
});

// Update faculty
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department, designation, phone, workload_hours, is_available } = req.body;

    await executeQuery(
      'UPDATE faculty SET name = ?, email = ?, department = ?, designation = ?, phone = ?, workload_hours = ?, is_available = ? WHERE id = ?',
      [name, email, department, designation, phone, workload_hours, is_available, req.params.id]
    );

    const updatedFaculty = await getSingleRow('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
    res.json(updatedFaculty);
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Error updating faculty' });
  }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM faculty WHERE id = ?', [req.params.id]);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ message: 'Error deleting faculty' });
  }
});

// Get faculty workload
router.get('/:id/workload', async (req, res) => {
  try {
    const faculty = await getSingleRow('SELECT id, name, workload_hours FROM faculty WHERE id = ?', [req.params.id]);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Get substitution count
    const substitutions = await getMultipleRows(
      'SELECT COUNT(*) as count FROM substitutions WHERE substitute_faculty_id = ? AND status = "confirmed"',
      [req.params.id]
    );

    res.json({
      ...faculty,
      substitution_count: substitutions[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching workload:', error);
    res.status(500).json({ message: 'Error fetching workload' });
  }
});

module.exports = router;

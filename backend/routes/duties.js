/**
 * Duty Routes
 * Handles duty assignment and triggers automatic substitution process
 */

const express = require('express');
const router = express.Router();
const { getMultipleRows, getSingleRow, executeQuery } = require('../db');
const { assignDutyPipeline } = require('../services/dutyService');

// Get all duties
router.get('/', async (req, res) => {
  try {
    const { date, faculty_id, status } = req.query;
    
    let query = `
      SELECT d.*, f.name as faculty_name, f.department 
      FROM duties d
      JOIN faculty f ON d.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND d.duty_date = ?';
      params.push(date);
    }
    if (faculty_id) {
      query += ' AND d.faculty_id = ?';
      params.push(faculty_id);
    }
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.duty_date, d.start_time';

    const duties = await getMultipleRows(query, params);
    res.json(duties);
  } catch (error) {
    console.error('Error fetching duties:', error);
    res.status(500).json({ message: 'Error fetching duties' });
  }
});

// Get duty by ID
router.get('/:id', async (req, res) => {
  try {
    const duty = await getSingleRow(
      'SELECT d.*, f.name as faculty_name, f.department FROM duties d JOIN faculty f ON d.faculty_id = f.id WHERE d.id = ?',
      [req.params.id]
    );
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }
    res.json(duty);
  } catch (error) {
    console.error('Error fetching duty:', error);
    res.status(500).json({ message: 'Error fetching duty' });
  }
});

// Create new duty (THIS TRIGgers THE AUTOMATION PIPELINE)
router.post('/', async (req, res) => {
  try {
    const { faculty_id, duty_type, duty_date, start_time, end_time, location, description } = req.body;

    if (!faculty_id || !duty_type || !duty_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Create the duty
    const result = await executeQuery(
      'INSERT INTO duties (faculty_id, duty_type, duty_date, start_time, end_time, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [faculty_id, duty_type, duty_date, start_time, end_time, location || null, description || null]
    );

    const newDuty = await getSingleRow(
      'SELECT d.*, f.name as faculty_name, f.department FROM duties d JOIN faculty f ON d.faculty_id = f.id WHERE d.id = ?',
      [result.insertId]
    );

    // Trigger the automation pipeline for substitute assignment
    try {
      const io = req.app.get('io');
      const pipelineResult = await assignDutyPipeline(newDuty, io);
      res.status(201).json({
        ...newDuty,
        automation: pipelineResult
      });
    } catch (pipelineError) {
      console.error('Automation pipeline error:', pipelineError);
      // Still return the duty, but indicate automation failed
      res.status(201).json({
        ...newDuty,
        automation: { success: false, message: pipelineError.message }
      });
    }
  } catch (error) {
    console.error('Error creating duty:', error);
    res.status(500).json({ message: 'Error creating duty' });
  }
});

// Update duty
router.put('/:id', async (req, res) => {
  try {
    const { duty_type, duty_date, start_time, end_time, location, description, status } = req.body;

    await executeQuery(
      'UPDATE duties SET duty_type = ?, duty_date = ?, start_time = ?, end_time = ?, location = ?, description = ?, status = ? WHERE id = ?',
      [duty_type, duty_date, start_time, end_time, location, description, status, req.params.id]
    );

    const updatedDuty = await getSingleRow(
      'SELECT d.*, f.name as faculty_name, f.department FROM duties d JOIN faculty f ON d.faculty_id = f.id WHERE d.id = ?',
      [req.params.id]
    );
    res.json(updatedDuty);
  } catch (error) {
    console.error('Error updating duty:', error);
    res.status(500).json({ message: 'Error updating duty' });
  }
});

// Delete duty
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM duties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Duty deleted successfully' });
  } catch (error) {
    console.error('Error deleting duty:', error);
    res.status(500).json({ message: 'Error deleting duty' });
  }
});

// Get duties for today
router.get('/today/all', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const duties = await getMultipleRows(`
      SELECT d.*, f.name as faculty_name, f.department 
      FROM duties d
      JOIN faculty f ON d.faculty_id = f.id
      WHERE d.duty_date = ? AND d.status = 'assigned'
      ORDER BY d.start_time
    `, [today]);
    res.json(duties);
  } catch (error) {
    console.error('Error fetching today duties:', error);
    res.status(500).json({ message: 'Error fetching duties' });
  }
});

module.exports = router;

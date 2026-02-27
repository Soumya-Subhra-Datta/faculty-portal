/**
 * Substitution Routes
 * Handles substitution management
 */

const express = require('express');
const router = express.Router();
const { getMultipleRows, getSingleRow, executeQuery } = require('../db');

// Get all substitutions
router.get('/', async (req, res) => {
  try {
    const { date, status, faculty_id } = req.query;
    
    let query = `
      SELECT s.*, 
        of.name as original_faculty_name, of.department as original_department,
        sf.name as substitute_faculty_name, sf.department as substitute_department,
        t.subject, t.year, t.section, t.room, t.day_of_week,
        d.duty_type, d.location as duty_location
      FROM substitutions s
      JOIN faculty of ON s.original_faculty_id = of.id
      JOIN faculty sf ON s.substitute_faculty_id = sf.id
      JOIN timetable t ON s.timetable_id = t.id
      LEFT JOIN duties d ON s.duty_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND s.substitution_date = ?';
      params.push(date);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (faculty_id) {
      query += ' AND (s.original_faculty_id = ? OR s.substitute_faculty_id = ?)';
      params.push(faculty_id, faculty_id);
    }
    if (req.query.substitute_id) {
      query += ' AND s.substitute_faculty_id = ?';
      params.push(req.query.substitute_id);
    }
    if (req.query.original_faculty_id) {
      query += ' AND s.original_faculty_id = ?';
      params.push(req.query.original_faculty_id);
    }

    query += ' ORDER BY s.substitution_date DESC, s.start_time';

    const substitutions = await getMultipleRows(query, params);
    res.json(substitutions);
  } catch (error) {
    console.error('Error fetching substitutions:', error);
    res.status(500).json({ message: 'Error fetching substitutions' });
  }
});

// Get substitution by ID
router.get('/:id', async (req, res) => {
  try {
    const substitution = await getSingleRow(`
      SELECT s.*, 
        of.name as original_faculty_name,
        sf.name as substitute_faculty_name,
        t.subject, t.year, t.section, t.room, t.day_of_week
      FROM substitutions s
      JOIN faculty of ON s.original_faculty_id = of.id
      JOIN faculty sf ON s.substitute_faculty_id = sf.id
      JOIN timetable t ON s.timetable_id = t.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (!substitution) {
      return res.status(404).json({ message: 'Substitution not found' });
    }
    res.json(substitution);
  } catch (error) {
    console.error('Error fetching substitution:', error);
    res.status(500).json({ message: 'Error fetching substitution' });
  }
});

// Manual override - admin can assign a specific substitute
router.post('/override', async (req, res) => {
  try {
    const { original_faculty_id, substitute_faculty_id, timetable_id, duty_id, substitution_date, start_time, end_time } = req.body;

    if (!original_faculty_id || !substitute_faculty_id || !timetable_id || !substitution_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await executeQuery(
      `INSERT INTO substitutions 
       (original_faculty_id, substitute_faculty_id, timetable_id, duty_id, substitution_date, start_time, end_time, status, ai_selected, admin_override) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', FALSE, TRUE)`,
      [original_faculty_id, substitute_faculty_id, timetable_id, duty_id || null, substitution_date, start_time, end_time]
    );

    const newSubstitution = await getSingleRow(`
      SELECT s.*, 
        of.name as original_faculty_name,
        sf.name as substitute_faculty_name
      FROM substitutions s
      JOIN faculty of ON s.original_faculty_id = of.id
      JOIN faculty sf ON s.substitute_faculty_id = sf.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json(newSubstitution);
  } catch (error) {
    console.error('Error creating override substitution:', error);
    res.status(500).json({ message: 'Error creating substitution' });
  }
});

// Update substitution status
router.put('/:id/status', async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    
    await executeQuery(
      'UPDATE substitutions SET status = ? WHERE id = ?',
      [newStatus, req.params.id]
    );

    const updated = await getSingleRow('SELECT * FROM substitutions WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating substitution status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Cancel substitution
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('UPDATE substitutions SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Substitution cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling substitution:', error);
    res.status(500).json({ message: 'Error cancelling substitution' });
  }
});

// Get pending substitutions
router.get('/pending/all', async (req, res) => {
  try {
    const substitutions = await getMultipleRows(`
      SELECT s.*, 
        of.name as original_faculty_name,
        sf.name as substitute_faculty_name,
        t.subject, t.year, t.section, t.room
      FROM substitutions s
      JOIN faculty of ON s.original_faculty_id = of.id
      JOIN faculty sf ON s.substitute_faculty_id = sf.id
      JOIN timetable t ON s.timetable_id = t.id
      WHERE s.status = 'pending'
      ORDER BY s.substitution_date, s.start_time
    `);
    res.json(substitutions);
  } catch (error) {
    console.error('Error fetching pending substitutions:', error);
    res.status(500).json({ message: 'Error fetching substitutions' });
  }
});

module.exports = router;

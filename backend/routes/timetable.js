/**
 * Timetable Routes
 * Handles timetable management
 */

const express = require('express');
const router = express.Router();
const { getMultipleRows, getSingleRow, executeQuery } = require('../db');

// Get all timetable entries
router.get('/', async (req, res) => {
  try {
    const { day, faculty_id, year, section } = req.query;
    
    let query = `
      SELECT t.*, f.name as faculty_name, f.department 
      FROM timetable t
      JOIN faculty f ON t.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (day) {
      query += ' AND t.day_of_week = ?';
      params.push(day);
    }
    if (faculty_id) {
      query += ' AND t.faculty_id = ?';
      params.push(faculty_id);
    }
    if (year) {
      query += ' AND t.year = ?';
      params.push(year);
    }
    if (section) {
      query += ' AND t.section = ?';
      params.push(section);
    }

    query += ' ORDER BY t.day_of_week, t.start_time';

    const timetable = await getMultipleRows(query, params);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await getSingleRow(
      'SELECT t.*, f.name as faculty_name, f.department FROM timetable t JOIN faculty f ON t.faculty_id = f.id WHERE t.id = ?',
      [req.params.id]
    );
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// Create new timetable entry
router.post('/', async (req, res) => {
  try {
    const { faculty_id, day_of_week, start_time, end_time, subject, year, section, room } = req.body;

    if (!faculty_id || !day_of_week || !start_time || !end_time || !subject || !year) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await executeQuery(
      'INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [faculty_id, day_of_week, start_time, end_time, subject, year, section || null, room || null]
    );

    const newEntry = await getSingleRow('SELECT t.*, f.name as faculty_name FROM timetable t JOIN faculty f ON t.faculty_id = f.id WHERE t.id = ?', [result.insertId]);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ message: 'Error creating timetable entry' });
  }
});

// Update timetable entry
router.put('/:id', async (req, res) => {
  try {
    const { faculty_id, day_of_week, start_time, end_time, subject, year, section, room } = req.body;

    await executeQuery(
      'UPDATE timetable SET faculty_id = ?, day_of_week = ?, start_time = ?, end_time = ?, subject = ?, year = ?, section = ?, room = ? WHERE id = ?',
      [faculty_id, day_of_week, start_time, end_time, subject, year, section, room, req.params.id]
    );

    const updatedEntry = await getSingleRow('SELECT t.*, f.name as faculty_name FROM timetable t JOIN faculty f ON t.faculty_id = f.id WHERE t.id = ?', [req.params.id]);
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ message: 'Error updating timetable entry' });
  }
});

// Delete timetable entry
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Error deleting timetable entry' });
  }
});

// Get timetable with substitution status for a specific date
router.get('/view/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    const timetable = await getMultipleRows(`
      SELECT 
        t.*,
        f.name as faculty_name,
        f.department,
        CASE 
          WHEN s.status = 'confirmed' THEN 'assigned'
          WHEN s.status = 'pending' THEN 'pending'
          ELSE 'normal'
        END as substitution_status,
        sf.name as substitute_name
      FROM timetable t
      JOIN faculty f ON t.faculty_id = f.id
      LEFT JOIN substitutions s ON t.id = s.timetable_id AND s.substitution_date = ? AND s.status != 'cancelled'
      LEFT JOIN faculty sf ON s.substitute_faculty_id = sf.id
      WHERE t.day_of_week = ?
      ORDER BY t.start_time
    `, [date, dayOfWeek]);

    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable view:', error);
    res.status(500).json({ message: 'Error fetching timetable view' });
  }
});

module.exports = router;

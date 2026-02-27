/**
 * Notification Routes
 * Handles notifications for faculty
 */

const express = require('express');
const router = express.Router();
const { getMultipleRows, getSingleRow, executeQuery } = require('../db');

// Get notifications for a faculty
router.get('/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { unread_only } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE faculty_id = ?';
    const params = [facultyId];

    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC';

    const notifications = await getMultipleRows(query, params);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await executeQuery('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read for a faculty
router.put('/faculty/:facultyId/read-all', async (req, res) => {
  try {
    await executeQuery('UPDATE notifications SET is_read = TRUE WHERE faculty_id = ?', [req.params.facultyId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Get unread count
router.get('/:facultyId/unread-count', async (req, res) => {
  try {
    const result = await getSingleRow(
      'SELECT COUNT(*) as count FROM notifications WHERE faculty_id = ? AND is_read = FALSE',
      [req.params.facultyId]
    );
    res.json({ count: result.count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

// Create notification (internal use)
router.post('/', async (req, res) => {
  try {
    const { faculty_id, title, message, type } = req.body;

    if (!faculty_id || !title || !message) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await executeQuery(
      'INSERT INTO notifications (faculty_id, title, message, type) VALUES (?, ?, ?, ?)',
      [faculty_id, title, message, type || 'info']
    );

    const notification = await getSingleRow('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

module.exports = router;

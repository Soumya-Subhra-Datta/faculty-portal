/**
 * Faculty Authentication Routes
 * Handles faculty login using their email
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getSingleRow, executeQuery } = require('../db');

// Faculty login using email
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get faculty by email
    const faculty = await getSingleRow('SELECT * FROM faculty WHERE email = ?', [email]);

    if (!faculty) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: faculty.id, email: faculty.email, role: 'faculty', name: faculty.name },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation
      }
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify faculty token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    if (decoded.role !== 'faculty') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

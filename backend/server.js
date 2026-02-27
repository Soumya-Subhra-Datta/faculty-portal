/**
 * Faculty Duty & Substitution Management Portal
 * Main Server File
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./db');
const facultyRoutes = require('./routes/faculty');
const timetableRoutes = require('./routes/timetable');
const dutyRoutes = require('./routes/duties');
const substitutionRoutes = require('./routes/substitutions');
const notificationRoutes = require('./routes/notifications');
const authRoutes = require('./routes/auth');
const facultyAuthRoutes = require('./routes/facultyAuth');

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty/auth', facultyAuthRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/duties', dutyRoutes);
app.use('/api/substitutions', substitutionRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Faculty Portal API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room for specific faculty
  socket.on('join_faculty', (facultyId) => {
    socket.join(`faculty_${facultyId}`);
    console.log(`👤 Faculty ${facultyId} joined room`);
  });

  // Join room for admin
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('👨‍💼 Admin joined room');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('⚠️  Warning: Database connection failed. Please check your configuration.');
    }

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎓 Faculty Duty & Substitution Management Portal          ║
║   🚀 Server running on port ${PORT}                           ║
║   📡 Socket.io enabled for real-time notifications           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };

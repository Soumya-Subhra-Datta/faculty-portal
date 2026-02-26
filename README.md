# 🎓 AI-Powered Faculty Duty & Substitution Management Portal

A comprehensive full-stack application for automated faculty duty management and intelligent substitution assignment using AI.

![Project Status](https://img.shields.io/badge/status-Production--Ready-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Setup Instructions](#-setup-instructions)
   - [Database Setup](#database-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
7. [AI Configuration](#-ai-configuration)
8. [Usage Guide](#-usage-guide)
9. [API Endpoints](#-api-endpoints)
10. [Demo Credentials](#-demo-credentials)
11. [Screenshots](#-screenshots)

---

## 🎯 Project Overview

This portal automates the entire process of faculty duty assignment and substitution management:

1. **Admin** assigns a duty (exam, invigilation, event, etc.)
2. **System automatically**:
   - Marks faculty as unavailable
   - Detects affected classes
   - Finds eligible substitutes
   - Uses **AI (Cerebras GPT-OSS-120B)** to rank candidates
   - Automatically assigns the best substitute
   - Updates timetable
   - Sends real-time notifications

---

## ✨ Features

### Admin Features
- ✅ Assign duties to faculty
- ✅ View all faculty schedules
- ✅ Monitor substitutions in real-time
- ✅ Override AI decisions manually
- ✅ View alerts for unassigned classes
- ✅ Manage faculty & timetable data

### Faculty Features
- ✅ View personal timetable
- ✅ View assigned duties
- ✅ View substitute classes assigned
- ✅ Receive real-time notifications
- ✅ See updated schedule instantly

### Core System Features
- 🤖 **AI-Powered Substitution Selection** using Cerebras
- 🔔 **Real-time Notifications** using Socket.io
- ⚡ **Automated Workflow** - No manual intervention needed
- 📊 **Dashboard Analytics**
- 🎨 **Modern Material UI**

---

## 💻 Tech Stack

### Frontend
- **React 18** - UI Framework
- **Material UI** - Component Library
- **Socket.io Client** - Real-time notifications
- **React Router** - Navigation
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **MySQL** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcryptjs** - Password Hashing
- **Axios** - HTTP Client for AI

### AI Integration
- **Cerebras Cloud** - GPT-OSS-120B Model

---

## 📁 Project Structure

```
faculty-portal/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── ai/               # AI integration
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   ├── db.js            # Database configuration
│   ├── server.js        # Main server file
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React contexts
│   │   ├── App.js      # Main app component
│   │   └── index.js    # Entry point
│   └── package.json
│
├── database/
│   └── setup.sql       # Database schema & seed data
│
├── README.md
└── .env.example        # Environment variables template
```

---

## 🔧 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

---

## 🚀 Setup Instructions

### 1. Database Setup

1. Install MySQL Server
2. Create a new database:
```
bash
mysql -u root -p
CREATE DATABASE faculty_portal;
```

3. Import the database schema and seed data:
```
bash
mysql -u root -p faculty_portal < database/setup.sql
```

### 2. Backend Setup

```
bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your settings (see below)
```

Edit `.env` file:
```
env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=faculty_portal
JWT_SECRET=your_secret_key
CEREBRAS_API_KEY=your_cerebras_api_key
```

Start the server:
```
bash
npm start
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```
bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on http://localhost:3000

---

## 🤖 AI Configuration

### Getting Cerebras API Key

1. Sign up at [Cerebras Cloud](https://cloud.cerebras.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env` file:

```
CEREBRAS_API_KEY=your_actual_api_key_here
```

### How AI Selection Works

The AI analyzes candidates based on:
1. **Department Match** - Prefer same department
2. **Workload Balance** - Lower workload preferred
3. **Current Substitutions** - Fewer is better
4. **Subject Expertise** - Relevant background

A fallback rule-based system is included if AI is unavailable.

---

## 📖 Usage Guide

### Login as Admin

1. Open http://localhost:3000
2. Login with credentials: `admin` / `admin123`
3. You'll see the Admin Dashboard

### Assign a Duty

1. Click "Assign Duty" button
2. Select Faculty Member
3. Select Duty Type (Exam, Invigilation, etc.)
4. Choose Date, Start Time, End Time
5. Add Location (optional)
6. Click "Assign Duty"

**Watch the magic:**
- System marks faculty as unavailable
- Finds affected classes
- AI selects best substitutes
- Substitutes are auto-assigned
- Notifications are sent in real-time

### View Timetable

1. Click "View Timetable" 
2. Filter by Day or Faculty
3. See color-coded status:
   - 🟢 Normal - Regular class
   - 🟡 Pending - Substitute pending
   - 🔴 No Teacher - Unassigned

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/verify` | Verify token |

### Faculty
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty` | Get all faculty |
| GET | `/api/faculty/:id` | Get faculty by ID |
| POST | `/api/faculty` | Create faculty |
| PUT | `/api/faculty/:id` | Update faculty |
| DELETE | `/api/faculty/:id` | Delete faculty |

### Timetable
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timetable` | Get timetable |
| GET | `/api/timetable/view/:date` | Get timetable with status |
| POST | `/api/timetable` | Create entry |
| PUT | `/api/timetable/:id` | Update entry |

### Duties (Triggers Automation)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/duties` | Get all duties |
| GET | `/api/duties/today/all` | Today's duties |
| POST | `/api/duties` | **Assign duty (triggers AI)** |
| PUT | `/api/duties/:id` | Update duty |

### Substitutions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/substitutions` | Get substitutions |
| POST | `/api/substitutions/override` | Manual assignment |
| PUT | `/api/substitutions/:id/status` | Update status |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/:facultyId` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

### Sample Faculty Data

The database includes 8 faculty members with pre-populated timetable data for demonstration.

---

## 🖥️ Screenshots

### Admin Dashboard
- Today's duties count
- Substitutions status
- Faculty overview
- Quick action buttons
- Real-time notifications

### Assign Duty Form
- Faculty selection dropdown
- Duty type selection
- Date and time pickers
- Automatic processing indicator

### Timetable View
- Filterable by day/faculty
- Color-coded status indicators
- Room information

---

## 🔌 Real-time Features

The system uses Socket.io for:
- Instant notification delivery
- Live dashboard updates
- Substitution status changes
- Duty processing notifications

---

## 📦 Build for Production

### Backend
```
bash
cd backend
npm run build
```

### Frontend
```
bash
cd frontend
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `.env`
- Kill process on port 5000 or 3000

### Socket.io Connection Failed
- Check backend is running
- Verify CORS settings
- Check firewall settings

---

## ✅ Production Checklist

- [x] Database schema with foreign keys
- [x] Sample data included
- [x] JWT authentication
- [x] Real-time notifications
- [x] AI integration ready
- [x] Error handling
- [x] Input validation
- [x] Loading states
- [x] Responsive design

---

**Built with ❤️ using React, Node.js, MySQL, and Cerebras AI**

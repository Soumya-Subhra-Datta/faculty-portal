import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AssignDuty from './pages/AssignDuty';
import Timetable from './pages/Timetable';
import Substitutions from './pages/Substitutions';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/assign-duty" element={
              <PrivateRoute role="admin">
                <AssignDuty />
              </PrivateRoute>
            } />
            <Route path="/admin/timetable" element={
              <PrivateRoute role="admin">
                <Timetable />
              </PrivateRoute>
            } />
            <Route path="/admin/substitutions" element={
              <PrivateRoute role="admin">
                <Substitutions />
              </PrivateRoute>
            } />
            <Route path="/faculty" element={
              <PrivateRoute role="faculty">
                <FacultyDashboard />
              </PrivateRoute>
            } />
            <Route path="/faculty/timetable" element={
              <PrivateRoute role="faculty">
                <Timetable />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

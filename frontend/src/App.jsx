import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AssignHomework from './pages/AssignHomework';
import UpdateMarks from './pages/UpdateMarks';
import UserManagement from './pages/UserManagement';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import ClassManagement from './pages/ClassManagement';
import FeeManagement from './pages/FeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import TeacherTimetable from './pages/TeacherTimetable';
import StudentTimetable from './pages/StudentTimetable';
import StudentMarks from './pages/StudentMarks';
import StudentAttendance from './pages/StudentAttendance';
import OAuthCallback from './pages/OAuthCallback';
import ReportsOverview from './pages/ReportsOverview';
import Register from './pages/Register';
import Announcements from './pages/Announcements';
import Messages from './pages/Messages';
import StudentChatbot from './pages/StudentChatbot';

// Mock Dashboard for other roles
const PlaceholderDashboard = ({ role }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-900">{role} Dashboard</h1>
    <p className="text-gray-500 mt-2">This module is under development. Please check back later.</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback/:provider" element={<OAuthCallback />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Layout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/students" element={<UserManagement role="Student" />} />
                  <Route path="/teachers" element={<UserManagement role="Teacher" />} />
                  <Route path="/parents" element={<UserManagement role="Parent" />} />
                  <Route path="/admins" element={<UserManagement role="Admin" />} />
                  <Route path="/classes" element={<ClassManagement />} />
                  <Route path="/fees" element={<FeeManagement />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/reports" element={<ReportsOverview role="Admin" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <Layout>
                <Routes>
                  <Route path="/" element={<TeacherDashboard />} />
                  <Route path="/timetable" element={<TeacherTimetable />} />
                  <Route path="/homework" element={<AssignHomework />} />
                  <Route path="/marks" element={<UpdateMarks />} />
                  <Route path="/attendance" element={<AttendanceManagement />} />
                  <Route path="/messages" element={<Messages />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Layout>
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/timetable" element={<StudentTimetable />} />
                  <Route path="/marks" element={<StudentMarks />} />
                  <Route path="/attendance" element={<StudentAttendance />} />
                  <Route path="/study-buddy" element={<StudentChatbot />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent/*" element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <Layout>
                <Routes>
                  <Route path="/" element={<ParentDashboard />} />
                  <Route path="/children" element={<ParentDashboard />} />
                  <Route path="/fees" element={<ParentDashboard />} />
                  <Route path="/messages" element={<Messages />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Principal Routes */}
          <Route path="/principal/*" element={
            <ProtectedRoute allowedRoles={['Principal']}>
              <Layout>
                <Routes>
                  <Route path="/" element={<PrincipalDashboard />} />
                  <Route path="/analytics" element={<PrincipalDashboard />} />
                  <Route path="/reports" element={<ReportsOverview role="Principal" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

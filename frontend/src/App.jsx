// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import Gradeinsight from './pages/Gradeinsight';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import TeacherPage from './pages/TeacherPage'; 
import StudentPage from './pages/StudentPage';
import SetPassword from './pages/SetPassword';
import ParentPage from './pages/ParentPage';
import SignUp from './pages/TeacherSignUp';

// Import the ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Gradeinsight />} />
        <Route path="/home" element={<Gradeinsight />} />
        <Route path="/teacherLogin" element={<TeacherLogin />} />
        <Route path="/studentLogin" element={<StudentLogin />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected routes - Teacher only */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute userType="teacher" redirectTo="/teacherLogin">
              <TeacherPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/TeacherPage" 
          element={
            <ProtectedRoute userType="teacher" redirectTo="/teacherLogin">
              <TeacherPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - Student only */}
        <Route 
          path="/StudentPage" 
          element={
            <ProtectedRoute userType="student" redirectTo="/studentLogin">
              <StudentPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - Any authenticated user */}
        <Route 
          path="/setPassword" 
          element={
            <ProtectedRoute redirectTo="/home">
              <SetPassword />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent" 
          element={
            <ProtectedRoute redirectTo="/home">
              <ParentPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all for 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;

// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedTeacherRoute from './components/ProtectedTeacherRoute';
import './App.css';

// Import your pages
import Gradeinsight from './pages/Gradeinsight';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import ParentLogin from './pages/ParentLogin';
import TeacherPage from './pages/TeacherPage'; 
import StudentPage from './pages/StudentPage';
import SetPassword from './pages/SetPassword';
import ParentPage from './pages/ParentPage';
import SignUp from './pages/TeacherSignUp';
import AdminPanel from './pages/AdminPanel';
import ParentSignup from './pages/ParentSignup';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Gradeinsight />} />
        {/* Pages */}
        <Route path="/home" element={<Gradeinsight />} />
        <Route path="/teacherLogin" element={<TeacherLogin />} />
        <Route path="/studentLogin" element={<StudentLogin />} />
        <Route path="/ParentLogin" element={<ParentLogin />} />
        <Route path="/teacher" element={
          <ProtectedTeacherRoute>
            <TeacherPage />
          </ProtectedTeacherRoute>
        } />
        <Route path="/TeacherPage" element={
          <ProtectedTeacherRoute>
            <TeacherPage />
          </ProtectedTeacherRoute>
        } />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/setPassword" element={<SetPassword />} />
        <Route path="/ParentPage" element={<ParentPage />} />
        <Route path="/signupPageForTeachers" element={<SignUp />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/ParentSignup" element={<ParentSignup />} />
      
      
        {/* Catch-all for 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;

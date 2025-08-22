// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';


// Import your pages
import Uploads from './pages/Uploads';
import Gradeinsight from './pages/Gradeinsight';
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import Skeleton from './pages/Skeleton'; 
import TeacherPage from './pages/TeacherPage'; 


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Gradeinsight />} />

        {/* Pages */}
        <Route path="/uploads" element={<Uploads />} />
        <Route path="/home" element={<Gradeinsight />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/skeleton" element={<Skeleton />} />
        <Route path="/teacher" element={<TeacherPage />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;

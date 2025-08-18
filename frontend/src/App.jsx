// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Uploads from './pages/Uploads';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Gradeinsight from './pages/Gradeinsight';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/" />} />

        {/* Pages */}
        <Route path="/uploads" element={<Uploads />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/index1" element={<Gradeinsight />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;

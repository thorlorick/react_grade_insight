// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Uploads from './pages/Uploads';
import Gradeinsight from './pages/Gradeinsight';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/" />} />

        {/* Pages */}
        <Route path="/uploads" element={<Uploads />} />
        <Route path="/login" element={<Gradeinsight />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;

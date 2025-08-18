// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Uploads from "./pages/Uploads";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to Grade Insight</h1>} />
        <Route path="/uploads" element={<Uploads />} />
      </Routes>
    </Router>
  );
}

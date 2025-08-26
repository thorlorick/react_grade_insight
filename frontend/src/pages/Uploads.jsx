// frontend/pages/uploads.jsx
import React, { useState } from 'react';
import UploadButton from '../components/UploadButton';

const UploadPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (data) => {
    if (data.ok) {
      setSummary({
        assignments: data.assignmentsCount,
        students: data.studentsCount,
        file: data.file
      });
      setError(null);
    } else {
      setError(data.error || 'Upload failed');
      setSummary(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload CSV Template</h1>

      <UploadButton onUploadSuccess={handleUploadSuccess} />

      {summary && (
        <div style={{ marginTop: '1rem', color: 'green' }}>
          <p>File: {summary.file}</p>
          <p>Assignments processed: {summary.assignments}</p>
          <p>Students processed: {summary.students}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;

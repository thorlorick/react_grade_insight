// src/components/UploadButton.jsx
import React, { useRef, useState } from 'react';

const UploadButton = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Open file dialog
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // ensures session cookie is sent
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setLoading(false);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default UploadButton;

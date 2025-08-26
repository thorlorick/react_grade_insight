// frontend/components/UploadButton.jsx
import React from 'react';

const UploadButton = ({ onUploadSuccess }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file); // must match backend field

    try {
      const res = await fetch('/api/uploads/template', {
        method: 'POST',
        body: formData,
        credentials: 'include' // send session cookie
      });
      const data = await res.json();
      onUploadSuccess(data);
    } catch (err) {
      onUploadSuccess({ ok: false, error: err.message });
    }
  };

  return (
    <label
      style={{
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: '#181B80',
        color: 'white',
        borderRadius: '0.5rem',
        cursor: 'pointer'
      }}
    >
      Upload CSV
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </label>
  );
};

export default UploadButton;

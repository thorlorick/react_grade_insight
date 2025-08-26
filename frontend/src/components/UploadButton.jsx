// frontend/components/UploadButton.jsx
import React from 'react';
import styles from './GenericButton.module.css'; // reuse same CSS as GenericButton

const UploadButton = ({ onUploadSuccess }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file); // must match backend

    try {
      const res = await fetch('https://gradeinsight.com:8083/api/uploads/template', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      onUploadSuccess(data);
    } catch (err) {
      onUploadSuccess({ ok: false, error: err.message });
    }
  };

  return (
    <label className={styles.button}>
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

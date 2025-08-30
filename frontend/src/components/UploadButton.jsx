// frontend/components/UploadButton.jsx
import React from 'react';
import styles from './GenericButton.module.css'; // reuse same CSS as GenericButton
import { getTeacherData } from '../api/teacherApi';

const UploadButton = ({ onUploadSuccess, refreshStudents }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected CSV file:', file.name);

    const formData = new FormData();
    formData.append('csv', file); // must match backend

    try {
      const res = await fetch('https://gradeinsight.com:8083/api/uploads/template', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();

      console.log('Upload response:', data);
      onUploadSuccess(data);

      // Optional: refresh student data automatically
      if (data.ok && refreshStudents) {
        const refreshed = await getTeacherData();
        refreshStudents(refreshed);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      onUploadSuccess({ ok: false, error: err.message });
    }
  };

  return (
    <label className={styles.button}>
      Upload <br />
      CSV
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

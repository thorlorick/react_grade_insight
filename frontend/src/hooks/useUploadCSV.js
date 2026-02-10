// frontend/hooks/useUploadCSV.js
import { useState } from 'react';
import { getTeacherData } from '../api/teacherApi';

export const useUploadCSV = (refreshStudents) => {
  const [uploadError, setUploadError] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);

  const uploadCSV = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch('/api/uploads/template', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();

      setUploadSummary(data);
      setUploadError(data.ok ? null : data.error);

      if (data.ok && refreshStudents) {
        const refreshed = await getTeacherData();
        refreshStudents(refreshed);
      }

      return data;
    } catch (err) {
      setUploadError(err.message);
      setUploadSummary(null);
      return { ok: false, error: err.message };
    }
  };

  return { uploadCSV, uploadError, uploadSummary };
};


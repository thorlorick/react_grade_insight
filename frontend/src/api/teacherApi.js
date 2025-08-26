// src/api/teacherApi.js
export const getTeacherData = async () => {
  try {
    // Use your backend port (8082 for HTTP or 8083 for HTTPS)
    const res = await fetch('http://www.gradeinsight.com:8082/api/teacher/data', { 
      credentials: 'include' 
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server responded with ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching teacher data:', err);
    throw err;
  }
};
// src/api/teacherApi.js
export const getTeacherData = async () => {
try {
  const res = await fetch('/api/teacher/data', { credentials: 'include' });
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

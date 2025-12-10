const API_BASE = 'https://gradeinsight.com:8083/api/teacher-admin';

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

export const getAssignments = async () => {
  const res = await fetch(`${API_BASE}/assignments`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
};

export const updateAssignment = async (assignmentId, data) => {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update assignment');
  return res.json();
};

export const deleteAssignment = async (assignmentId) => {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete assignment');
  return res.json();
};

// ============================================
// GRADE MANAGEMENT
// ============================================

export const getGradesForAssignment = async (assignmentId) => {
  const res = await fetch(`${API_BASE}/grades/${assignmentId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch grades');
  return res.json();
};

export const updateGrade = async (gradeId, grade) => {
  const res = await fetch(`${API_BASE}/grades/${gradeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ grade })
  });
  if (!res.ok) throw new Error('Failed to update grade');
  return res.json();
};

export const addGrade = async (student_id, assignment_id, grade) => {
  const res = await fetch(`${API_BASE}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ student_id, assignment_id, grade })
  });
  if (!res.ok) throw new Error('Failed to add grade');
  return res.json();
};

export const deleteGrade = async (gradeId) => {
  const res = await fetch(`${API_BASE}/grades/${gradeId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete grade');
  return res.json();
};

// ============================================
// PASSWORD RESET
// ============================================

export const resetMyPassword = async (current_password, new_password) => {
  const res = await fetch(`${API_BASE}/reset-my-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ current_password, new_password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to reset password');
  }
  return res.json();
};

export const resetStudentPassword = async (student_email) => {
  const res = await fetch(`${API_BASE}/reset-student-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ student_email })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to reset student password');
  }
  return res.json();
};

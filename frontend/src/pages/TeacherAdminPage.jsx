import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TeacherAdminPage.module.css';
import {
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getGradesForAssignment,
  updateGrade,
  deleteGrade,
  resetMyPassword,
  resetStudentPassword
} from '../api/teacherAdminApi';

const TeacherAdminPage = () => {
  const navigate = useNavigate();

  // Assignment state
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    name: '',
    due_date: '',
    max_points: ''
  });

  // Grade state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeValue, setGradeValue] = useState('');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [studentEmail, setStudentEmail] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [studentPasswordMessage, setStudentPasswordMessage] = useState('');

  // Messages
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [gradeMessage, setGradeMessage] = useState('');

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setAssignmentMessage('❌ Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment.id);
    setAssignmentFormData({
      name: assignment.name,
      due_date: assignment.due_date || '',
      max_points: assignment.max_points || ''
    });
  };

  const handleSaveAssignment = async (assignmentId) => {
    try {
      await updateAssignment(assignmentId, assignmentFormData);
      setAssignmentMessage('✅ Assignment updated successfully');
      setEditingAssignment(null);
      loadAssignments();
      setTimeout(() => setAssignmentMessage(''), 3000);
    } catch (err) {
      setAssignmentMessage('❌ Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId, assignmentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assignmentName}"?\n\nThis will also delete all grades for this assignment. This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const result = await deleteAssignment(assignmentId);
      setAssignmentMessage(`✅ Assignment deleted (${result.grades_deleted} grades removed)`);
      loadAssignments();
      setTimeout(() => setAssignmentMessage(''), 3000);
    } catch (err) {
      setAssignmentMessage('❌ Failed to delete assignment');
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setAssignmentFormData({ name: '', due_date: '', max_points: '' });
  };

  // Grade management
  const handleSelectAssignment = async (assignmentId) => {
    if (selectedAssignment === assignmentId) {
      setSelectedAssignment(null);
      setGrades([]);
      return;
    }

    try {
      setLoadingGrades(true);
      setSelectedAssignment(assignmentId);
      const data = await getGradesForAssignment(assignmentId);
      setGrades(data);
    } catch (err) {
      console.error('Error loading grades:', err);
      setGradeMessage('❌ Failed to load grades');
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade.grade_id);
    setGradeValue(grade.grade || '');
  };

  const handleSaveGrade = async (gradeId) => {
    try {
      await updateGrade(gradeId, parseFloat(gradeValue));
      setGradeMessage('✅ Grade updated successfully');
      setEditingGrade(null);
      handleSelectAssignment(selectedAssignment);
      setTimeout(() => setGradeMessage(''), 3000);
    } catch (err) {
      setGradeMessage('❌ Failed to update grade');
    }
  };

  const handleDeleteGrade = async (gradeId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the grade for ${studentName}?`
    );
    
    if (!confirmed) return;

    try {
      await deleteGrade(gradeId);
      setGradeMessage('✅ Grade deleted successfully');
      handleSelectAssignment(selectedAssignment);
      setTimeout(() => setGradeMessage(''), 3000);
    } catch (err) {
      setGradeMessage('❌ Failed to delete grade');
    }
  };

  const handleCancelGradeEdit = () => {
    setEditingGrade(null);
    setGradeValue('');
  };

  // Password management
  const handleResetMyPassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('❌ New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage('❌ New password must be at least 6 characters');
      return;
    }

    try {
      await resetMyPassword(passwordForm.current_password, passwordForm.new_password);
      setPasswordMessage('✅ Password updated successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordMessage(`❌ ${err.message}`);
    }
  };

  const handleResetStudentPassword = async (e) => {
    e.preventDefault();
    
    try {
      const result = await resetStudentPassword(studentEmail);
      setStudentPasswordMessage(`✅ Password reset! Temporary password: ${result.temp_password}`);
      setStudentEmail('');
      setTimeout(() => setStudentPasswordMessage(''), 10000);
    } catch (err) {
      setStudentPasswordMessage(`❌ ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.container}>
      {/* Background */}
      <div className={styles.background} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>TEACHER ADMIN</h1>
          <button onClick={() => navigate('/teacher')} className={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        
        {/* Assignment Manager Card */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>📝</span>
            Assignment Manager
          </h2>

          {assignmentMessage && (
            <div className={styles.message}>
              {assignmentMessage}
            </div>
          )}

          {loadingAssignments ? (
            <div className={styles.loading}>Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className={styles.emptyState}>No assignments found</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Assignment Name</th>
                    <th>Due Date</th>
                    <th>Max Points</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        {editingAssignment === assignment.id ? (
                          <input
                            type="text"
                            value={assignmentFormData.name}
                            onChange={(e) => setAssignmentFormData({
                              ...assignmentFormData,
                              name: e.target.value
                            })}
                            className={styles.input}
                          />
                        ) : (
                          assignment.name
                        )}
                      </td>
                      <td>
                        {editingAssignment === assignment.id ? (
                          <input
                            type="date"
                            value={assignmentFormData.due_date}
                            onChange={(e) => setAssignmentFormData({
                              ...assignmentFormData,
                              due_date: e.target.value
                            })}
                            className={styles.input}
                          />
                        ) : (
                          formatDate(assignment.due_date)
                        )}
                      </td>
                      <td>
                        {editingAssignment === assignment.id ? (
                          <input
                            type="number"
                            value={assignmentFormData.max_points}
                            onChange={(e) => setAssignmentFormData({
                              ...assignmentFormData,
                              max_points: e.target.value
                            })}
                            className={styles.input}
                            style={{ width: '80px' }}
                          />
                        ) : (
                          assignment.max_points || 'N/A'
                        )}
                      </td>
                      <td>{assignment.student_count}</td>
                      <td>
                        {editingAssignment === assignment.id ? (
                          <div className={styles.buttonGroup}>
                            <button
                              onClick={() => handleSaveAssignment(assignment.id)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className={styles.buttonGroup}>
                            <button
                              onClick={() => handleEditAssignment(assignment)}
                              className={styles.editButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id, assignment.name)}
                              className={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Grade Editor Card */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>✏️</span>
            Grade Editor
          </h2>

          {gradeMessage && (
            <div className={styles.message}>
              {gradeMessage}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Select Assignment:</label>
            <select
              value={selectedAssignment || ''}
              onChange={(e) => handleSelectAssignment(e.target.value)}
              className={styles.select}
            >
              <option value="">-- Choose an assignment --</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} ({assignment.student_count} students)
                </option>
              ))}
            </select>
          </div>

          {loadingGrades && (
            <div className={styles.loading}>Loading grades...</div>
          )}

          {selectedAssignment && !loadingGrades && grades.length === 0 && (
            <div className={styles.emptyState}>No grades found for this assignment</div>
          )}

          {selectedAssignment && grades.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Grade</th>
                    <th>Max Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.grade_id}>
                      <td>{grade.first_name} {grade.last_name}</td>
                      <td>{grade.email}</td>
                      <td>
                        {editingGrade === grade.grade_id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value)}
                            className={styles.input}
                            style={{ width: '80px' }}
                          />
                        ) : (
                          grade.grade !== null ? grade.grade : 'N/A'
                        )}
                      </td>
                      <td>{grade.max_points || 'N/A'}</td>
                      <td>
                        {editingGrade === grade.grade_id ? (
                          <div className={styles.buttonGroup}>
                            <button
                              onClick={() => handleSaveGrade(grade.grade_id)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelGradeEdit}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className={styles.buttonGroup}>
                            <button
                              onClick={() => handleEditGrade(grade)}
                              className={styles.editButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.grade_id, `${grade.first_name} ${grade.last_name}`)}
                              className={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Password Reset Card */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>🔑</span>
            Password Management
          </h2>

          {/* Reset Own Password */}
          <div className={styles.passwordSection}>
            <h3 className={styles.sectionSubtitle}>Reset My Password</h3>
            
            {passwordMessage && (
              <div className={styles.message}>
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handleResetMyPassword} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password:</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value
                  })}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>New Password:</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value
                  })}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password:</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value
                  })}
                  required
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.primaryButton}>
                Update My Password
              </button>
            </form>
          </div>

          <div className={styles.divider} />

          {/* Reset Student Password */}
          <div className={styles.passwordSection}>
            <h3 className={styles.sectionSubtitle}>Reset Student Password</h3>
            
            {studentPasswordMessage && (
              <div className={styles.message}>
                {studentPasswordMessage}
              </div>
            )}

            <form onSubmit={handleResetStudentPassword} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Student Email:</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.primaryButton}>
                Reset Student Password
              </button>
            </form>

            <p className={styles.helpText}>
              Note: This will generate a temporary password that the student must change on their next login.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default TeacherAdminPage;

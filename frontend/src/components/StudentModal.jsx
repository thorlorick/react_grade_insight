import React, { useState, useEffect } from 'react';
import styles from './StudentModal.module.css';

const StudentModal = ({ studentId, onClose }) => {
  const [studentData, setStudentData] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://gradeinsight.com:8083/api/teacher/student/${studentId}/details`, {
          credentials: 'include'
        });

        if (!res.ok) {
          console.error('Failed to fetch student data', res.status);
          setStudentData(null);
          return;
        }

        const data = await res.json();
        // Ensure structure
        setStudentData({
          student: data.student || {},
          assignments: data.assignments || [],
          notes: data.notes || []
        });
      } catch (err) {
        console.error('Failed to fetch student data', err);
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchStudentData();
  }, [studentId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`https://gradeinsight.com:8083/api/teacher/notes/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note: newNote })
      });

      if (res.ok) {
        const savedNote = await res.json();
        setStudentData(prev => ({
          ...prev,
          notes: [...(prev.notes || []), { 
            ...savedNote, 
            note: newNote, 
            id: savedNote.id || Date.now(), 
            created_at: new Date().toISOString() 
          }]
        }));
        setNewNote('');
      } else {
        console.error('Failed to save note', res.status);
      }
    } catch (err) {
      console.error('Error saving note', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddNote();
    }
  };

  // Calculate simple grade average
  const calculateAverage = (assignments) => {
    const gradedAssignments = assignments.filter(a => a.grade !== null && a.grade !== undefined);
    if (gradedAssignments.length === 0) return null;
    
    const totalEarned = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);
    const totalPossible = gradedAssignments.reduce((sum, a) => sum + a.max_points, 0);
    
    if (totalPossible === 0) return null;
    
    return (totalEarned / totalPossible) * 100;
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading student data...</div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal}>
          <div className={styles.error}>Student data not found.</div>
        </div>
      </div>
    );
  }

  const { student, assignments, notes } = studentData;
  const average = calculateAverage(assignments);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ✕
          </button>
          <div>
            <h2 className={styles.studentName}>
              {student?.first_name} {student?.last_name}
            </h2>
            <p className={styles.studentEmail}>{student?.email}</p>
          </div>
          {average !== null && (
            <div className={styles.averageDisplay}>
              <div className={styles.averageLabel}>Average</div>
              <div className={styles.averageValue}>{average.toFixed(1)}%</div>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Assignments</h3>
            {assignments.length > 0 ? (
              <ul className={styles.assignmentsList}>
                {assignments.map(a => {
                  const hasGrade = a.grade !== null && a.grade !== undefined;
                  const grade = hasGrade ? `${a.grade}/${a.max_points}` : '—';
                  
                  // Helper function to determine grade classification
                  const getGradeClass = () => {
                    if (!hasGrade) return styles.noGrade;
                    
                    const percentage = a.grade / a.max_points;
                    
                    // Grade classifications
                    if (percentage >= 0.9) return styles.excellentGrade;  // 90%+ - A
                    if (percentage >= 0.8) return styles.highGrade;       // 80-89% - B  
                    if (percentage >= 0.7) return styles.goodGrade;       // 70-79% - C
                    if (percentage >= 0.6) return styles.midGrade;        // 60-69% - D
                    return styles.lowGrade;                               // Below 60% - F
                  };
                  
                  return (
                    <li key={a.assignment_id} className={styles.assignmentItem}>
                      <span className={styles.assignmentName}>
                        {a.assignment_name}
                      </span>
                      <span 
                        className={`${styles.assignmentGrade} ${getGradeClass()}`}
                        title={hasGrade ? `${Math.round((a.grade / a.max_points) * 100)}%` : 'Not graded'}
                      >
                        {grade}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                No assignments found for this student.
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Teacher Notes</h3>
            {notes.length > 0 ? (
              <ul className={styles.notesList}>
                {notes.map(n => (
                  <li key={n.id} className={styles.noteItem}>
                    <p className={styles.noteText}>{n.note}</p>
                    <small className={styles.noteDate}>
                      {new Date(n.created_at).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                No notes yet. Add one below!
              </div>
            )}
          </div>

          <div className={styles.addNoteSection}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a note about this student... (Ctrl+Enter to save)"
              className={styles.textarea}
              maxLength={2000}
            />
            <button 
              onClick={handleAddNote} 
              className={styles.addButton}
              disabled={!newNote.trim()}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;

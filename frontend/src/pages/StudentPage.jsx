import React, { useState, useEffect, useCallback } from 'react';
import StudentDashboardTable from '../components/StudentDashboardTable';
import styles from './StudentPage.module.css';

// Custom hook for student data
const useStudentData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://gradeinsight.com:8083/api/student/data', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/StudentLogin';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

// Custom hook for teacher notes
const useStudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('https://gradeinsight.com:8083/api/student/notes', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return { notes, loading };
};

const StudentPage = () => {
  const { data: assignments, loading: assignmentsLoading, error } = useStudentData();
  const { notes, loading: notesLoading } = useStudentNotes();
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('https://gradeinsight.com:8083/api/auth/studentLogout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/StudentLogin';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className={styles.body}>
      {/* Header */}
      <div className={styles.navbar}>
        <h1 className={styles.navLogo}>Grade Insight</h1>
        
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      <div className={styles.pageWrapper}>
        {/* Assignments Table */}
        <div className={styles.tableSection}>
          <StudentDashboardTable
            data={assignments}
            loading={assignmentsLoading}
            error={error}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>

        {/* Teacher Notes Section */}
        <div className={styles.notesSection}>
          <h3>Teacher Notes</h3>
          
          {notesLoading ? (
            <div className={styles.loading}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <div>
              {notes.map((note, index) => (
                <div key={index} className={styles.noteItem}>
                  <p>{note.note}</p>
                  <small>{note.teacher} — {new Date(note.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS } from 'react-joyride';
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

  // Joyride state - Start with state instead of localStorage check
  const [runTour, setRunTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // Check localStorage and start tour after components and data are loaded
  useEffect(() => {
    // Check if localStorage is available and user hasn't seen tour
    try {
      const tourSeen = localStorage.getItem('hasSeenStudentTour');
      if (tourSeen) {
        setHasSeenTour(true);
      } else {
        // Wait for data to load AND components to render before starting tour
        if (!assignmentsLoading && !notesLoading && assignments.length > 0) {
          const timer = setTimeout(() => {
            setRunTour(true);
          }, 500);
          
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
      // If localStorage fails, just run the tour once after data loads
      if (!assignmentsLoading && !notesLoading && assignments.length > 0) {
        const timer = setTimeout(() => {
          setRunTour(true);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [assignmentsLoading, notesLoading, assignments.length]);

  const tourSteps = [
    {
      target: 'body',
      content: 'Welcome to your Student Dashboard! Let\'s take a quick tour.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: `.${styles.tableSection}`,
      content: 'Here is your assignments table. You can see grades and sort columns.',
      placement: 'bottom',
    },
    {
      target: `.${styles.notesSection}`,
      content: 'This section shows notes your teacher has left for you.',
      placement: 'top',
    },
    {
      target: `.${styles.logoutButton}`,
      content: 'When you're done, click here to log out safely.',
      placement: 'bottom',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      try {
        localStorage.setItem('hasSeenStudentTour', 'true');
      } catch (e) {
        console.warn('Could not save tour status:', e);
      }
    }
  };

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
      {/* Joyride Tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          },
        }}
      />

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

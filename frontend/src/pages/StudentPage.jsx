import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import StudentDashboardCards from '../components/StudentDashboardCards';
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
      const response = await fetch('/api/student/data', {
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
        const response = await fetch('/api/student/notes', {
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

// Calculate simple grade average
const calculateAverage = (assignments) => {
  const gradedAssignments = assignments.filter(a => a.grade !== null && a.grade !== undefined);
  if (gradedAssignments.length === 0) return null;
  
  const totalEarned = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);
  const totalPossible = gradedAssignments.reduce((sum, a) => sum + a.max_points, 0);
  
  if (totalPossible === 0) return null;
  
  return (totalEarned / totalPossible) * 100;
};

// Get letter grade from percentage
const getLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Get color class based on percentage
const getGradeColorClass = (percentage) => {
  if (percentage >= 90) return styles.gradeA;
  if (percentage >= 80) return styles.gradeB;
  if (percentage >= 70) return styles.gradeC;
  if (percentage >= 60) return styles.gradeD;
  return styles.gradeF;
};

const StudentPage = () => {
  const { data: assignments, loading: assignmentsLoading, error } = useStudentData();
  const { notes, loading: notesLoading } = useStudentNotes();
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Calculate average
  const average = assignments.length > 0 ? calculateAverage(assignments) : null;

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
      target: '#assignments-cards',
      content: 'Here are your assignments displayed as cards. Each card shows your grade and percentage.',
      placement: 'bottom',
    },
    {
      target: '#teacher-notes',
      content: 'This section shows notes your teacher has left for you.',
      placement: 'top',
    },
    {
      target: '#logout-btn',
      content: 'When you are done, click here to log out safely.',
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
      await fetch('/api/auth/studentLogout', {
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
        
        {/* Average Display */}
        <div className={styles.averageContainer}>
          {assignmentsLoading ? (
            <span className={styles.averageLoading}>Calculating...</span>
          ) : average !== null ? (
            <div className={styles.averageDisplay}>
              <span className={styles.averageLabel}>Your Average:</span>
              <span className={`${styles.averageValue} ${getGradeColorClass(average)}`}>
                {average.toFixed(1)}% ({getLetterGrade(average)})
              </span>
            </div>
          ) : (
            <span className={styles.averageEmpty}>No grades yet</span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          id="logout-btn"
        >
          Logout
        </button>
      </div>

      <div className={styles.pageWrapper}>
        {/* Assignments Card Grid */}
        <div className={styles.tableSection} id="assignments-cards">
          <StudentDashboardCards
            data={assignments}
            loading={assignmentsLoading}
            error={error}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>

        {/* Teacher Notes Section */}
        <div className={styles.notesSection} id="teacher-notes">
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

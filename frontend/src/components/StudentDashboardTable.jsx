// src/components/StudentDashboardTable.jsx
import React from "react";
import styles from './StudentDashboardTable.module.css';

const StudentDashboardTable = ({ data, loading, studentName }) => {
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingMessage}>
          Loading your grades...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.noDataMessage}>
          No grades found. Check back later for updates!
        </div>
      </div>
    );
  }

  // Helper function to format grade display
  const formatGrade = (grade, maxPoints) => {
    if (!grade && grade !== 0) return "Not graded";
    
    if (maxPoints) {
      return `${grade}/${maxPoints}`;
    }
    
    // If it's a percentage or letter grade
    if (typeof grade === 'string') {
      return grade;
    }
    
    return grade.toString();
  };

  // Helper function to get grade color class
  const getGradeColorClass = (grade, maxPoints) => {
    if (!grade && grade !== 0) return styles.notGraded;
    
    let percentage;
    if (maxPoints) {
      percentage = (grade / maxPoints) * 100;
    } else if (typeof grade === 'number' && grade <= 100) {
      percentage = grade;
    } else {
      return styles.defaultGrade;
    }

    if (percentage >= 90) return styles.gradeA;
    if (percentage >= 80) return styles.gradeB;
    if (percentage >= 70) return styles.gradeC;
    if (percentage >= 60) return styles.gradeD;
    return styles.gradeF;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h2>{studentName ? `${studentName}'s Grades` : 'My Grades'}</h2>
        <div className={styles.gradeStats}>
          <span>Total Assignments: {data.length}</span>
        </div>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.assignmentCell}>
                  <div className={styles.assignmentName}>
                    {row.assignment_name || "Unnamed Assignment"}
                  </div>
                  {row.assignment_type && (
                    <div className={styles.assignmentType}>
                      {row.assignment_type}
                    </div>
                  )}
                </td>
                
                <td className={styles.gradeCell}>
                  <span 
                    className={`${styles.gradeValue} ${getGradeColorClass(row.grade, row.max_points)}`}
                  >
                    {formatGrade(row.grade, row.max_points)}
                  </span>
                  {row.percentage && (
                    <div className={styles.percentage}>
                      ({row.percentage}%)
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboardTable;
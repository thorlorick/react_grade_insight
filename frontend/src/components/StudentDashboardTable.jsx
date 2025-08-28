// src/components/StudentDashboardTable.jsx
import React from "react";
import styles from './StudentDashboardTable.module.css';

const StudentDashboardTable = ({ data, loading }) => {
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

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h2>My Grades</h2>
        <div className={styles.gradeStats}>
          <span>Total Assignments: {data.length}</span>
        </div>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Subject</th>
              <th>Grade</th>
              <th>Teacher</th>
              <th>Due Date</th>
              <th>Submitted</th>
              <th>Feedback</th>
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
                
                <td className={styles.subjectCell}>
                  {row.subject || "N/A"}
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
                
                <td className={styles.teacherCell}>
                  {row.teacher_name || row.teacher_first_name && row.teacher_last_name 
                    ? `${row.teacher_first_name} ${row.teacher_last_name}`
                    : "N/A"}
                </td>
                
                <td className={styles.dateCell}>
                  {formatDate(row.due_date)}
                </td>
                
                <td className={styles.submittedCell}>
                  <span className={`${styles.submissionStatus} ${
                    row.submitted ? styles.submitted : styles.notSubmitted
                  }`}>
                    {row.submitted ? "✓ Yes" : "✗ No"}
                  </span>
                  {row.date_submitted && (
                    <div className={styles.submittedDate}>
                      {formatDate(row.date_submitted)}
                    </div>
                  )}
                </td>
                
                <td className={styles.feedbackCell}>
                  {row.feedback ? (
                    <div className={styles.feedbackText} title={row.feedback}>
                      {row.feedback.length > 50 
                        ? `${row.feedback.substring(0, 50)}...` 
                        : row.feedback}
                    </div>
                  ) : (
                    <span className={styles.noFeedback}>No feedback</span>
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
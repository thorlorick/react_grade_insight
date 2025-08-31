// src/components/ParentGradesTable.jsx
import React from "react";
import styles from './ParentGradesTable.module.css';

const ParentGradesTable = ({ data, loading, studentName }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading {studentName}'s grades...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          No grades found for {studentName}. Check back later for updates!
        </div>
      </div>
    );
  }

  const formatGrade = (grade, maxPoints) => {
    if (!grade && grade !== 0) return "Not graded";
    if (maxPoints) return `${grade}/${maxPoints}`;
    if (typeof grade === 'string') return grade;
    return grade.toString();
  };

  const getGradeColorClass = (grade, maxPoints) => {
    if (!grade && grade !== 0) return styles.missingGrade;

    let percentage;
    if (maxPoints) {
      percentage = (grade / maxPoints) * 100;
    } else if (typeof grade === 'number' && grade <= 100) {
      percentage = grade;
    } else {
      return '';
    }

    if (percentage >= 90) return styles.gradeA;
    if (percentage >= 80) return styles.gradeB;
    if (percentage >= 70) return styles.gradeC;
    if (percentage >= 60) return styles.gradeD;
    return styles.gradeF;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.headerCell} ${styles.assignmentHeader}`}>
                Assignment
              </th>
              <th className={`${styles.headerCell} ${styles.dueDateHeader}`}>
                Due Date
              </th>
              <th className={`${styles.headerCell} ${styles.maxPointsHeader}`}>
                Max Points
              </th>
              <th className={`${styles.headerCell} ${styles.gradeHeader}`}>
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={styles.row}>
                <td className={`${styles.cell} ${styles.assignmentCell}`}>
                  <div>{row.assignment_name || "Unnamed Assignment"}</div>
                  {row.assignment_type && (
                    <small style={{ opacity: 0.7 }}>
                      {row.assignment_type}
                    </small>
                  )}
                </td>
                <td className={`${styles.cell} ${styles.dueDateCell}`}>
                  {formatDate(row.due_date)}
                </td>
                <td className={`${styles.cell} ${styles.maxPointsCell}`}>
                  {row.max_points || "—"}
                </td>
                <td className={`${styles.cell} ${styles.gradeCell}`}>
                  <span className={getGradeColorClass(row.grade, row.max_points)}>
                    {formatGrade(row.grade, row.max_points)}
                  </span>
                  {row.percentage && (
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
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

export default ParentGradesTable;
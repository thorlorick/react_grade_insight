// src/components/StudentDashboardTable.jsx
import React from "react";
import styles from './StudentDashboardTable.module.css';

const StudentDashboardTable = ({ data, loading, studentName }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your grades...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          No grades found. Check back later for updates!
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

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.headerCell} ${styles.staticHeader}`}>
                Assignment
              </th>
              <th className={`${styles.headerCell} ${styles.dynamicHeader}`}>
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={styles.row}>
                <td className={`${styles.cell} ${styles.staticCell}`}>
                  <div>{row.assignment_name || "Unnamed Assignment"}</div>
                  {row.assignment_type && (
                    <small style={{ opacity: 0.7 }}>
                      {row.assignment_type}
                    </small>
                  )}
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

export default StudentDashboardTable;

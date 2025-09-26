import React from "react";
import styles from './StudentDashboardTable.module.css';

const StudentDashboardTable = ({ data, loading, onSort, sortConfig }) => {
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
    if (grade === null || grade === undefined) return "Not graded";
    if (maxPoints) return `${grade}/${maxPoints}`;
    return grade.toString();
  };

  const getGradeColorClass = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return styles.missingGrade;

    const percentage = maxPoints ? (grade / maxPoints) * 100 : grade;
    if (percentage >= 90) return styles.gradeA;
    if (percentage >= 80) return styles.gradeB;
    if (percentage >= 70) return styles.gradeC;
    if (percentage >= 60) return styles.gradeD;
    return styles.gradeF;
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={`${styles.headerCell} ${styles.staticHeader}`}
                onClick={() => onSort('assignment_name')}
              >
                Assignment{getSortIndicator('assignment_name')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.dynamicHeader}`}
                onClick={() => onSort('grade')}
              >
                Grade{getSortIndicator('grade')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.dynamicHeader}`}
                onClick={() => onSort('due_date')}
              >
                Due Date{getSortIndicator('due_date')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={styles.row}>
                <td className={`${styles.cell} ${styles.staticCell}`}>
                  <div>{row.assignment_name || "Unnamed Assignment"}</div>
                  {row.assignment_type && (
                    <small style={{ opacity: 0.7 }}>{row.assignment_type}</small>
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
                <td className={`${styles.cell} ${styles.gradeCell}`}>
                  {row.due_date ? new Date(row.due_date).toLocaleDateString() : '-'}
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

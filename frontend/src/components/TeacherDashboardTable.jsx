import React, { useState, useMemo } from 'react';
import styles from './TeacherDashboardTable.module.css';

const TeacherDashboardTable = ({ data = [], loading = false }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Transform flat API data into structured table data
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return { students: [], assignments: [] };

    // Get unique students
    const studentsMap = new Map();
    const assignmentsMap = new Map();

    data.forEach(row => {
      const studentKey = `${row.student_id}`;
      const assignmentKey = `${row.assignment_id}`;

      // Build students map
      if (!studentsMap.has(studentKey)) {
        studentsMap.set(studentKey, {
          student_id: row.student_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          grades: new Map()
        });
      }

      // Build assignments map
      if (!assignmentsMap.has(assignmentKey)) {
        assignmentsMap.set(assignmentKey, {
          assignment_id: row.assignment_id,
          assignment_name: row.assignment_name,
          assignment_date: row.assignment_date,
          max_points: row.max_points
        });
      }

      // Add grade to student
      studentsMap.get(studentKey).grades.set(assignmentKey, {
        score: row.score,
        max_points: row.max_points
      });
    });

    const students = Array.from(studentsMap.values());
    const assignments = Array.from(assignmentsMap.values()).sort((a, b) => {
      if (!a.assignment_date && !b.assignment_date) return a.assignment_name.localeCompare(b.assignment_name);
      if (!a.assignment_date) return 1;
      if (!b.assignment_date) return -1;
      return new Date(a.assignment_date) - new Date(b.assignment_date);
    });

    return { students, assignments };
  }, [data]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort students based on current sort config
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return tableData.students;

    return [...tableData.students].sort((a, b) => {
      if (sortConfig.key === 'name') {
        const aVal = a.name.toLowerCase();
        const bVal = b.name.toLowerCase();
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (sortConfig.key === 'email') {
        const aVal = a.email.toLowerCase();
        const bVal = b.email.toLowerCase();
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Assignment column sorting
      const assignmentId = sortConfig.key;
      const aGrade = a.grades.get(assignmentId);
      const bGrade = b.grades.get(assignmentId);
      
      // Handle missing grades
      if (!aGrade && !bGrade) return 0;
      if (!aGrade) return sortConfig.direction === 'asc' ? 1 : -1;
      if (!bGrade) return sortConfig.direction === 'asc' ? -1 : 1;
      
      const aScore = aGrade.score || 0;
      const bScore = bGrade.score || 0;
      
      return sortConfig.direction === 'asc' ? aScore - bScore : bScore - aScore;
    });
  }, [tableData.students, sortConfig]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading grades...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>No grade data available</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th 
                className={`${styles.headerCell} ${styles.staticHeader}`}
                onClick={() => handleSort('name')}
              >
                <span className={styles.headerContent}>
                  Name
                  {sortConfig.key === 'name' && (
                    <span className={styles.sortIcon}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              <th 
                className={`${styles.headerCell} ${styles.staticHeader}`}
                onClick={() => handleSort('email')}
              >
                <span className={styles.headerContent}>
                  Email
                  {sortConfig.key === 'email' && (
                    <span className={styles.sortIcon}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              {tableData.assignments.map((assignment) => (
                <th
                  key={assignment.assignment_id}
                  className={`${styles.headerCell} ${styles.dynamicHeader}`}
                  onClick={() => handleSort(assignment.assignment_id.toString())}
                  title={`Due: ${formatDate(assignment.assignment_date)}`}
                >
                  <span className={styles.headerContent}>
                    {assignment.assignment_name}
                    {sortConfig.key === assignment.assignment_id.toString() && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.student_id} className={styles.row}>
                <td className={`${styles.cell} ${styles.staticCell}`}>
                  {student.name}
                </td>
                <td className={`${styles.cell} ${styles.staticCell}`}>
                  {student.email}
                </td>
                {tableData.assignments.map((assignment) => {
                  const grade = student.grades.get(assignment.assignment_id.toString());
                  let gradeClass = styles.missingGrade;

                  if (grade) {
                    const pct = grade.score / grade.max_points;
                    if (pct >= 0.8) gradeClass = styles.highGrade;
                    else if (pct >= 0.5) gradeClass = styles.midGrade;
                    else gradeClass = styles.lowGrade;
                  }

                  return (
                    <td 
                      key={assignment.assignment_id} 
                      className={`${styles.cell} ${styles.gradeCell} ${gradeClass}`}
                    >
                      {grade ? `${grade.score}/${grade.max_points}` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherDashboardTable;

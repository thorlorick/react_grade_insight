import React, { useState, useMemo } from 'react';
import styles from './TeacherDashboardTable.module.css';
import StudentModal from './StudentModal';

const TeacherDashboardTable = ({ data = [], loading = false, teacherId }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // --- Modal state ---
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const tableData = useMemo(() => {
    if (!data || data.length === 0) return { students: [], assignments: [] };

    const studentsMap = new Map();
    const assignmentsMap = new Map();

    data.forEach(row => {
      const studentKey = `${row.student_id}`;
      const assignmentKey = `${row.assignment_id}`;

      if (!studentsMap.has(studentKey)) {
        studentsMap.set(studentKey, {
          student_id: row.student_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          grades: new Map()
        });
      }

      if (!assignmentsMap.has(assignmentKey)) {
        assignmentsMap.set(assignmentKey, {
          assignment_id: row.assignment_id,
          assignment_name: row.assignment_name,
          assignment_date: row.assignment_date,
          max_points: row.max_points
        });
      }

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

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getGradeClass = (grade) => {
    // No grade submitted/recorded
    if (!grade || grade.score === null || grade.score === undefined) {
      return styles.missingGrade;
    }
    
    // Ensure we have valid numbers for calculation
    const score = Number(grade.score);
    const maxPoints = Number(grade.max_points);
    
    if (isNaN(score) || isNaN(maxPoints) || maxPoints === 0) {
      return styles.missingGrade;
    }
    
    const percentage = score / maxPoints;
    
    // Grade classifications
    if (percentage >= 0.9) return styles.excellentGrade;  // 90%+ - A
    if (percentage >= 0.8) return styles.highGrade;       // 80-89% - B  
    if (percentage >= 0.7) return styles.goodGrade;       // 70-79% - C
    if (percentage >= 0.6) return styles.midGrade;        // 60-69% - D
    return styles.lowGrade;                               // Below 60% - F
  };

  const getGradeDisplay = (grade) => {
    if (!grade || grade.score === null || grade.score === undefined) {
      return { display: '', letterGrade: '' };
    }
    
    const score = Number(grade.score);
    const maxPoints = Number(grade.max_points);
    
    if (isNaN(score) || isNaN(maxPoints) || maxPoints === 0) {
      return { display: '', letterGrade: '' };
    }
    
    const percentage = (score / maxPoints) * 100;
    let letterGrade = '';
    
    if (percentage >= 90) letterGrade = 'A';
    else if (percentage >= 80) letterGrade = 'B';
    else if (percentage >= 70) letterGrade = 'C';
    else if (percentage >= 60) letterGrade = 'D';
    else letterGrade = 'F';
    
    return {
      display: `${score}/${maxPoints}`,
      letterGrade,
      percentage: percentage.toFixed(1)
    };
  };

 const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return tableData.students;
    return [...tableData.students].sort((a, b) => {
      if (sortConfig.key === 'name') return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      if (sortConfig.key === 'email') return sortConfig.direction === 'asc'
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);

      const assignmentId = sortConfig.key;
      const aGrade = a.grades.get(assignmentId);
      const bGrade = b.grades.get(assignmentId);

      if (!aGrade && !bGrade) return 0;
      if (!aGrade) return sortConfig.direction === 'asc' ? 1 : -1;
      if (!bGrade) return sortConfig.direction === 'asc' ? -1 : 1;

      return sortConfig.direction === 'asc'
        ? (aGrade.score || 0) - (bGrade.score || 0)
        : (bGrade.score || 0) - (aGrade.score || 0);
    });
  }, [tableData.students, sortConfig]);

  if (loading) return <div className={styles.container}><div className={styles.loading}>Loading grades...</div></div>;
  if (!data || data.length === 0) return <div className={styles.container}><div className={styles.emptyState}>No grade data available</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.headerCell} ${styles.staticHeader}`} onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className={`${styles.headerCell} ${styles.staticHeader}`} onClick={() => handleSort('email')}>
                Email {sortConfig.key === 'email' && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              {tableData.assignments.map(a => (
                <th key={a.assignment_id} className={`${styles.headerCell} ${styles.dynamicHeader}`} onClick={() => handleSort(a.assignment_id.toString())} title={`Due: ${a.assignment_date || 'No due date'}`}>
                  {a.assignment_name} {sortConfig.key === a.assignment_id.toString() && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(student => (
              <tr
                key={student.student_id}
                className={styles.row}
                onClick={() => setSelectedStudentId(student.student_id)}
                style={{ cursor: 'pointer' }} // indicates clickable row
              >
                <td className={`${styles.cell} ${styles.staticCell}`}>{student.name}</td>
                <td className={`${styles.cell} ${styles.staticCell}`}>{student.email}</td>
                {tableData.assignments.map(assignment => {
                  const grade = student.grades.get(assignment.assignment_id.toString());
                  const gradeInfo = getGradeDisplay(grade);
                  return (
                    <td key={assignment.assignment_id} className={`${styles.cell} ${styles.gradeCell} ${getGradeClass(grade)}`} title={gradeInfo.letterGrade ? `${gradeInfo.percentage}% (${gradeInfo.letterGrade})` : 'Not submitted'}>
                      {grade ? <div className={styles.gradeContainer}><span className={styles.gradeScore}>{gradeInfo.display}</span>{gradeInfo.letterGrade && <small className={styles.letterGrade}>{gradeInfo.letterGrade}</small>}</div> : <span className={styles.noGrade}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedStudentId && (
        <StudentModal
          studentId={selectedStudentId}
          teacherId={teacherId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};

export default TeacherDashboardTable;

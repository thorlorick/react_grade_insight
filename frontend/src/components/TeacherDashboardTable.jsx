import React, { useState, useMemo } from 'react';
import styles from './TeacherDashboardTable.module.css';
import StudentModal from './StudentModal'; // placeholder modal component

const TeacherDashboardTable = ({ data = [], loading = false }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // --- Modal state ---
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // --- Click handler to open modal ---
  const handleStudentClick = async (studentEmail) => {
    // Fetch student data + assignments + notes from backend
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(studentEmail)}/details`);
      const studentData = await res.json();
      setSelectedStudent(studentData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch student data', err);
    }
  };

  // ...sorting and grade helpers (same as your current code)...

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return tableData.students;

    return [...tableData.students].sort((a, b) => {
      if (sortConfig.key === 'name') {
        const aVal = a.name.toLowerCase();
        const bVal = b.name.toLowerCase();
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (sortConfig.key === 'email') {
        const aVal = a.email.toLowerCase();
        const bVal = b.email.toLowerCase();
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      const assignmentId = sortConfig.key;
      const aGrade = a.grades.get(assignmentId);
      const bGrade = b.grades.get(assignmentId);

      if (!aGrade && !bGrade) return 0;
      if (!aGrade) return sortConfig.direction === 'asc' ? 1 : -1;
      if (!bGrade) return sortConfig.direction === 'asc' ? -1 : 1;

      const aScore = aGrade.score || 0;
      const bScore = bGrade.score || 0;

      return sortConfig.direction === 'asc' ? aScore - bScore : bScore - aScore;
    });
  }, [tableData.students, sortConfig]);

  if (loading) return <div className={styles.loading}>Loading grades...</div>;
  if (!data || data.length === 0) return <div className={styles.emptyState}>No grade data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => setSortConfig({ key: 'name', direction: 'asc' })}>Name</th>
              <th onClick={() => setSortConfig({ key: 'email', direction: 'asc' })}>Email</th>
              {tableData.assignments.map(a => (
                <th key={a.assignment_id}>{a.assignment_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(student => (
              <tr key={student.student_id}>
                <td>
                  <button onClick={() => handleStudentClick(student.email)}>
                    {student.name}
                  </button>
                </td>
                <td>{student.email}</td>
                {tableData.assignments.map(assignment => {
                  const grade = student.grades.get(assignment.assignment_id.toString());
                  const display = grade ? `${grade.score}/${grade.max_points}` : '—';
                  return <td key={assignment.assignment_id}>{display}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedStudent && (
        <StudentModal 
          studentData={selectedStudent} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default TeacherDashboardTable;

// src/components/TeacherCardGrid.jsx
import React, { useState } from 'react';
import styles from './TeacherCardGrid.module.css';
import StudentModal from './StudentModal';

const TeacherCardGrid = ({ data, loading }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  if (loading) {
    return <div className={styles.loading}>Loading students...</div>;
  }

  if (!data || data.length === 0) {
    return <div className={styles.loading}>No student data available.</div>;
  }

  // Group data by student and calculate averages
  const studentMap = {};
  data.forEach(row => {
    const key = row.email;
    if (!studentMap[key]) {
      studentMap[key] = {
        student_id: row.student_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        assignments: [],
      };
    }
    // Store assignment data (matching StudentModal structure)
    if (row.score !== null && row.score !== undefined && row.max_points > 0) {
      studentMap[key].assignments.push({
        grade: row.score,
        max_points: row.max_points
      });
    }
  });

  // Convert to array and add averages (using StudentModal's calculation method)
  const students = Object.values(studentMap).map(student => {
    const gradedAssignments = student.assignments.filter(a => a.grade !== null && a.grade !== undefined);
    
    let average = null;
    if (gradedAssignments.length > 0) {
      const totalEarned = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);
      const totalPossible = gradedAssignments.reduce((sum, a) => sum + a.max_points, 0);
      
      if (totalPossible > 0) {
        average = ((totalEarned / totalPossible) * 100).toFixed(1);
      }
    }
    
    return {
      ...student,
      average
    };
  });

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
    } else {
      if (a.average === null) return 1;
      if (b.average === null) return -1;
      return parseFloat(b.average) - parseFloat(a.average);
    }
  });

  // Get grade color based on average
  const getGradeClass = (avg) => {
    if (avg === null) return 'nograde';
    if (avg >= 90) return 'excellent';
    if (avg >= 80) return 'high';
    if (avg >= 70) return 'good';
    if (avg >= 60) return 'mid';
    return 'low';
  };

  return (
    <div className={styles.container}>
      {/* Sort controls */}
      <div className={styles.controls}>
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name (A-Z)</option>
          <option value="average">Average (High to Low)</option>
        </select>
      </div>

      {/* Card grid */}
      <div className={styles.grid}>
        {sortedStudents.map((student) => (
          <div
            key={student.email}
            className={`${styles.card} ${styles[getGradeClass(student.average)]}`}
            onClick={() => setSelectedStudentId(student.student_id)}
          >
            <div className={styles.name}>
              {student.first_name} {student.last_name}
            </div>
            <div className={styles.average}>
              {student.average !== null ? `${student.average}%` : 'N/A'}
            </div>
          </div>
        ))}
      </div>

      {/* Student detail modal */}
      {selectedStudentId && (
        <StudentModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};

export default TeacherCardGrid;
